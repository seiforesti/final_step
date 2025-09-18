# Advanced Edge Computing in Data Source Management vs. Azure Purview Integration Runtime

## Executive Summary

This document contrasts Microsoft Azure Purview’s Integration Runtime model with the Datawave platform’s advanced, modular Data Source system that implements edge-computing for micro-level governance and a macro-level microservices factory for end-to-end data governance. It explains how our system replaces a centralized runtime with distributed, intelligent edge components that perform connection, discovery, enrichment, and protection close to the data, then hand off to platform modules (Catalog, Scan Rule Sets, Scan Logic, Classifications, Compliance, RBAC) for macro governance.

## Part I — How Azure Purview Handles Data Source Connectivity and Discovery (Baseline)

- Integration Runtime (IR): centralized runtime process (self-hosted or managed) that brokers connectivity to sources, executes ingestion/discovery tasks, and moves/reads metadata.
- Connectivity: uses connectors per source; relies on network routes/VPN/privileged endpoints through IR; credentials configured via Key Vault/IR.
- Discovery & extraction: scheduled/classic crawlers scan schemas/tables, pull metadata to Purview; scale via more IR nodes; latency depends on central runner placement.
- Security & governance: access via Azure AD and role assignments; activity logs in Azure Monitor; compliance via Azure Policy integrations.
- Strengths: managed experience, broad connector coverage, simple onboarding; Limitations: centralized execution bottlenecks, less edge autonomy, coarse-grained performance controls, limited adaptive optimization at run-time.

## Part II — Datawave Edge-Computing Data Source System (Micro Governance at the Edge)

- Distributed edge connectors: per-source intelligent connectors execute near the data (on-prem, VPC, region). They handle auth negotiation, TLS/SSL, secret retrieval, and health checks locally.
- Adaptive connection fabric: dynamic pool sizing, PgBouncer multiplexing, backpressure, and circuit breaking at the edge to protect sources during bursts.
- Cloud-aware routing: provider-aware policies (AWS/Azure/GCP), replica awareness, locality-first routing, and latency-based failover without central bottlenecks.
- Intelligent schema discovery: phased, load-sensitive discovery with incremental sync; AI-enhanced metadata inference and quality scoring executed at the edge to minimize data movement.
- ABAC/RBAC at the edge: permission checks, deny assignments, and audit logging applied before discovery/reads, reducing risk and noisy scans.
- Secure secret plane: pluggable secret managers; envelope encryption; just-in-time decryption at the edge with ephemeral use and strict audit.
- Telemetry up, data stays local: only metadata/metrics flow to the platform via secure channels; raw data remains at the source.

## Part III — Micro → Macro Governance Factory (Interconnected Circle)

- Micro (edge) layer: connection, discovery, enrichment, and security enforcement occur close to sources. Outputs: normalized metadata, health metrics, quality signals.
- Handoff bus: streaming/evented transport forwards small, structured payloads to the macro plane with retries, deduplication, and ordering.
- Macro (platform) layer: specialized microservices consume edge outputs:
  - Catalog: asset registration, lineage graph, semantic enrichment, glossary linking.
  - Scan Rule Sets: WHAT to analyze with scopes, sampling, and templates.
  - Scan Logic: HOW/WHEN to execute with workflows, orchestration, resource plans.
  - Classifications: AI/manual labeling, sensitivity levels, validation loops.
  - Compliance: framework mapping, policy enforcement, continuous validation.
  - RBAC: cross-cutting permissions, access review, audit.
- Feedback loop: macro insights (performance, risk, policy) drive edge reconfiguration (sampling, concurrency, windows) for continuous optimization.

## Part IV — Key Differentiators vs Azure Purview IR

- Execution model: decentralized, edge-first vs centralized IR; reduces latency and blast radius; improves locality and compliance posture.
- Performance control: fine-grained, live-tunable pools, throttling, and batching at edge vs coarse IR scaling.
- Intelligence: AI-enhanced discovery, adaptive strategies, and predictive allocation embedded at edge vs centrally orchestrated crawls.
- Security: ABAC + deny-first evaluation at edge, ephemeral secrets, metadata-only egress vs broader IR access paths.
- Reliability: localized retries, replica failover, and graceful degradation per site vs IR job-centric retries.
- Cost & scale: locality reduces egress; multiplexing increases efficiency; macro plane scales consumers independently.

## Part V — End-to-End Flow (Edge to Factory)

1) Source onboarded → edge connector validates, hydrates secrets, verifies TLS, warms pool.
2) Health gates → baseline checks; if degraded, edge applies conservative strategy or defers.
3) Discovery plan → phased walk (db → schema → table → column), incremental diffing.
4) Edge enrichment → semantic hints, quality scoring, sensitivity heuristics.
5) Emit payloads → compact metadata, metrics, lineage hints to macro bus.
6) Macro consumers → Catalog registers; Rule Sets scope areas; Scan Logic schedules; Classifications label; Compliance validates; RBAC gates access.
7) Feedback → macro KPIs tune edge sampling, concurrency, and windows.

## Part VI — Edge Computing Capabilities Matrix

- Connectivity: locality-aware, replica-smart, cloud-identity-native.
- Performance: PgBouncer multiplexing, adaptive concurrency, batch/stream modes.
- Reliability: retry trees, window shifting, warm-standby edges, poison-batch quarantine.
- Security: just-in-time secrets, ABAC prefilters, TLS everywhere, audit fan-out.
- Observability: fine-grained metrics (per stage/source), live telemetry, heatmaps.
- Governance: pre-labeling, pre-validation, policy hints emitted with metadata.

## Part VII — Why This Matters for Enterprise Governance

- Minimizes data movement; maximizes locality and compliance adherence.
- Converts discovery into governed events, not heavyweight jobs.
- Enables continuous governance: small, frequent, safe updates instead of large batch crawls.
- Scales elastically across geographies and tenants without central chokepoints.

## Appendix — Frontend Integration Highlights (Data Sources SPA)

- Live discovery orchestration UI: real-time progress, edge telemetry, health and pool stats.
- Resource and replica views: visualize locality, failover posture, and policy gates.
- Policy-aware actions: only permissible discovery/sync actions shown based on RBAC.
- Analytics: edge vs macro KPIs, optimization recommendations, and cost insights.

---

This architecture replaces a centralized Integration Runtime with an intelligent, distributed edge layer feeding a macro microservices factory. The result is faster, safer, and more adaptive governance that respects locality, reduces cost, and accelerates downstream value across Catalog, Rule Sets, Scan Logic, Classifications, Compliance, and RBAC.
