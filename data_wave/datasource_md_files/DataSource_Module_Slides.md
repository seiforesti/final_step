# Slide 1 — Data Source Management: Universal, Secure, Enterprise-Ready

> Data Source Management System: Universal connectivity (MySQL, MongoDB, PostgreSQL), real-time cloud integration, advanced pooling, and intelligent failover.
> Compliance Rules System: SOC2/GDPR/HIPAA/PCI-DSS with automated workflows, real-time monitoring, and full audit trails.
> Classifications System: 3-tier AI classification with scikit-learn + transformers, adaptive learning, and context-aware rules.
> Scan-Rule-Sets System: AI pattern recognition, adaptive rule optimization, predictive scanning, and multi-source coordination.
> Data Catalog System: Intelligent asset discovery, advanced lineage, semantic search, and business glossary integration.
> Scan Logic System: Unified orchestration engine, AI-driven optimization, real-time performance monitoring, cross-system coordination.
> RBAC/Access System: Comprehensive security, granular access control, multi-tenant support, and advanced authentication.

- **What it is**: Foundation that onboards and governs data sources across on‑prem, cloud, and hybrid
- **Databases supported**: MySQL, PostgreSQL, MongoDB (+ cloud object store connectors extendable)
- **Unified model**: `cloud_provider`, `location`, `cloud_config`, `replica_config`, `ssl_config`, pool knobs
- **Security by design**:
  - Secrets via secret manager; optional Fernet encryption at rest
  - TLS/SSL enforced via `ssl_config` (CA/cert/key)
  - RBAC on all CRUD/validate/discover routes; full audit trail
- **Performance & scale**:
  - PgBouncer for PostgreSQL (client:DB ≈ 20:1), dynamic pool sizing/overflow/timeout
  - Adaptive discovery (conservative/balanced/aggressive), batching, retries, cleanup
- **Reliability**:
  - Health checks (latency, errors, uptime, storage), recommendations
  - Replica‑aware routing and hybrid failover (primary/secondary)

---

# Slide 2 — How It Works (Exact Backend Flow)

> Models drive connectors: provider/TLS/replicas in `DataSource` become real, validated connections.
> Discovery → Catalog → Classification/Compliance run end‑to‑end with adaptive performance and full audit.

- **Create/Update**
  - Persist in `DataSource` with provider, TLS, replicas, pooling, and metadata
  - Secrets stored by reference (`password_secret`), never plaintext in DB
- **Validate & Health**
  - `validate_connection()` opens a real connection and executes a ping/SELECT
  - `get_data_source_health()` returns status, latency, metrics, and fixes
- **Discover & Govern**
  - Enterprise Schema Discovery builds provider‑correct, TLS‑hardened URIs
  - Batches table/column metadata, adapts to load, disposes connections
  - Catalog/Lineage updated; Classification & Compliance consume same shapes
- **Operate at Scale**
  - Pool metrics and reconfiguration at runtime; PgBouncer for multiplexing
  - Stats APIs: entity/size, sensitivity/classification, compliance, performance (avg query time, cache hit)
- **Key relationships**
  - Connectors ⇄ `cloud_config`/`ssl_config`/`replica_config`
  - Discovery → Catalog/Classification/Compliance
  - RBAC/Audit guards every operation; Racine orchestrates workflows