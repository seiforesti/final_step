# Data Source Management: Edge Computing vs. Azure Purview Integration Runtime (Deep Technical Comparison)

## Executive Overview

- **Azure Purview (Integration Runtime)**: Centralized, connector-driven execution hosted in managed IR runtimes; focuses on discovery/scan via scheduled pipelines, with limited edge optimization and coarse-grained governance at scan time.
- **PurSight/DataWave (Edge Micro-Governance)**: Distributed, edge-executed micro-systems embedded at the data source boundary. Applies micro-governance during connect→discover→profile, then hands off enriched, governed metadata to macro services (Catalog, Scan Rule Sets, Scan Logic, Classifications, Compliance) for end-to-end factory orchestration.

---

## What Azure Purview Integration Runtime Typically Does

- Connectivity via managed IR nodes; scheduled scans pull schema/lineage centrally.
- Standardized connectors; limited adaptive strategies and source-aware performance tuning.
- Discovery as macro activity; minimal in-scan micro-governance or AI augmentation.
- Centralized throttling; basic retry/backoff; limited local health/resource sensing.
- Export findings to catalog; downstream teams add quality, classification, or rules post-scan.

---

## What PurSight/DataWave Edge Micro-Governance Adds (Key Differentiators)

- Edge execution: discovery/profiling runs close to sources; resource-aware, replica-aware, latency-sensitive.
- Micro-governance in-path: classification signals, quality metrics, ABAC checks, and compliance hints computed at discovery time.
- Adaptive discovery: conservative/balanced/aggressive strategies, table-batching, connection budgets, PgBouncer-aware pooling.
- Intelligent context: AI semantic analysis, relationship inference, health scoring, cache-hit analysis, and size/query-time estimation.
- Secure by design: secrets via pluggable managers, TLS/SSL, encryption-at-rest, RBAC-enforced routes, detailed audits.
- Evented architecture: SSE/WebSocket progress, background tasks, and incremental sync for low-latency feedback loops.

---

## Evidence in Models, Services, and Routes (Deep Analysis)

- Models (scan_models.py): `DataSource` with `cloud_provider`, `cloud_config`, `replica_config`, `ssl_config`, pool knobs; discovery history, health/compliance metrics; ties to scans and rule sets.
- Services:
  - data_source_service.py: secret management + Fernet encryption; dynamic password resolution; validate/test; health/stats; size/query-time estimates; compliance/quality scoring; cloud/pool updates; favorites; growth/quality metrics.
  - data_source_connection_service.py: schema discovery, previews, profiling, diagnostics (invoked by routes) with source-aware execution.
- Routes:
  - data_discovery_routes.py: discover schema, real-time progress (SSE/WS), previews, profiling, discovery jobs/history, selective cataloging, sync; RBAC-gated.
  - discovery_routes.py: discovery jobs, assets, stats, stop/cancel, export; strategy selection and performance telemetry.

These pieces together form an edge-capable pipeline that performs meaningful micro-governance before macro orchestration begins.

---

## Micro vs. Macro Governance: Flow and Responsibilities

- Micro (Edge, at Data Source boundary):
  - Connection hardening, secret retrieval, TLS, pool sizing; latency-aware validation.
  - Schema discovery with adaptive strategy; table/column/index/constraint capture.
  - Early intelligence: quality heuristics, sensitivity hints, semantic tags, relationship inference, size and cache metrics.
  - ABAC/RBAC gates applied to discovery operations; audit every action.
  - Emit enriched assets to Catalog; produce health/compliance baselines for downstream.

- Macro (Factory orchestration across modules):
  - Catalog persists/enriches assets; lineage; glossary mapping; analytics.
  - Scan Rule Sets define WHAT to scan (scope/rules); Scan Logic decides HOW to execute at scale.
  - Classification applies ML/AI labeling; Compliance validates frameworks (GDPR, SOC2, HIPAA...).
  - Orchestrators schedule, parallelize, and monitor scans with SLAs; dashboards/alerts close the loop.

Result: a circular, self-feeding system where micro signals shape macro execution, and macro outcomes tune micro policies.

---

## Advanced Edge Computing Mechanics (Inside the Data Source Subsystem)

- Resource-aware planning: connection/time budgets, pool timeouts, max concurrency per engine; PgBouncer multiplexing.
- Replica/region awareness: route reads to replicas; prefer low-latency AZ/region; auto-failover recommendations.
- Incremental sync: discovery stats and deltas streamed; background jobs resume; partial results preserved on cancel.
- AI assistance: semantic entity naming, pattern detection, relationship density scoring, risk hints.
- Diagnostics: real cache hit ratio (Postgres/MySQL), estimated size, query-time sampling, health recommendations.
- Security layers: encrypted secrets; multi-backend secret store; RBAC dependencies on every operation; audit trails.

---

## Side-by-Side: Purview IR vs. PurSight Edge Micro-Governance

- Execution locality: centralized IR vs. distributed edge runners near sources.
- Adaptivity: fixed schedules vs. adaptive strategies informed by live metrics.
- Governance timing: post-scan macro-only vs. micro-in-path plus macro orchestration.
- Performance control: generic throttling vs. pool tuning, PgBouncer, budgets, dynamic concurrency.
- Observability: job logs vs. metrics, SSE/WS progress, health/compliance/quality baselines.
- Security posture: standard auth vs. encrypted secrets, ABAC/RBAC at discovery routes, comprehensive audits.

---

## End-to-End Flow Diagram (Conceptual)

1) Connect (secrets, TLS, pool) → 2) Discover (adaptive, batched) → 3) Edge intelligence (quality, sensitivity, relationships, size, cache) → 4) Emit to Catalog (micro outputs) → 5) Rule Sets define WHAT → 6) Scan Logic orchestrates HOW → 7) Classification/Compliance apply macro policies → 8) Results feed back to refine micro strategies.

---

## Why This Surpasses Azure Purview for Enterprise Edge Needs

- Treats discovery as a first-class governed activity, not merely ingestion.
- Minimizes central bottlenecks by pushing compute and decisions to the edge.
- Produces high-signal metadata early, enabling smarter macro orchestration.
- Tight integration with RBAC and audit fits regulated environments.
- Measurably better performance via pooling, PgBouncer, and adaptive concurrency.

---

## Presenter Notes (Use in Final Slides)

- Position data source subsystem as the “edge brain” of governance.
- Emphasize micro→macro factory: micro filters/labels/metrics at source; macro refines/operationalizes at scale.
- Contrast with Purview IR’s centralized, post-hoc model.
- Call out SSE/WS, real metrics, and ABAC/RBAC as enterprise differentiators.
