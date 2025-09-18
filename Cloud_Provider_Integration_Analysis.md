# Cloud Provider Integration in PurSight

## Purpose and Scope

Cloud provider integration enables PurSight to connect to, manage, and govern data sources hosted on AWS, Microsoft Azure, and Google Cloud Platform (GCP) while maintaining a unified governance model. It abstracts cloud-specific authentication, networking, and security so the platform can deliver consistent discovery, scanning, cataloging, classification, compliance, and RBAC across cloud, on‑prem, and hybrid environments.

---

## Where It Lives in the Backend (Conceptual Map)

- Data model anchors
  - `DataSource.cloud_provider` (AWS | Azure | GCP)
  - `DataSource.cloud_config` (JSON: credentials, roles, regions, endpoints, options)
  - `DataSource.ssl_config` (JSON: CA/cert/key paths or flags)
  - `DataSource.replica_config` (JSON: read replicas, replica set members for document stores)
- Connection orchestration
  - Cloud‑aware connectors in the connection service (location‑aware base + DB‑specific connectors)
  - Pool initialization/reconfiguration and connection health stats surfaced through service methods
- Discovery and governance
  - Enterprise schema discovery adapts strategy per environment and resource level
  - Catalog, classification, and compliance systems consume cloud‑discovered metadata in the same unified shapes

Note: This is an architectural explanation based on the implemented fields, services, and route behaviors; no code is shown here.

---

## Responsibilities of Cloud Provider Integration

1) Unified connection establishment
- Selects the correct connector based on `source_type` and `location` (cloud/hybrid/on‑prem)
- Builds provider‑appropriate connection arguments from `cloud_config`, `ssl_config`, and `replica_config`
- Honors provider networking constraints (private endpoints, VPC/VNet peering, regional endpoints)

2) Authentication and identity
- AWS: Supports IAM‑based auth and regional configuration via `cloud_config` (e.g., `access_key_id`, `secret_access_key`, `region`, `use_iam_auth`)
- Azure: Supports Service Principal and Managed Identity via `cloud_config` (e.g., `tenant_id`, `client_id`, `client_secret`, `use_managed_identity`)
- GCP: Supports Service Account based flows via `cloud_config` (service account JSON or environment bindings)
- Secrets are never stored as plaintext in models; they are referenced through the secret manager and optionally encrypted at rest

3) Transport security
- Enables TLS/SSL when `ssl_config` is present; attaches CA/cert/key or flags to the connection layer
- Aligns with provider security baselines (e.g., enforced TLS for managed databases)

4) High availability and replica awareness
- Supports cloud read replicas and document store replica sets using `replica_config`
- For hybrid mode, provides failover between primary and secondary endpoints

5) Resource‑aware discovery and scanning
- Adjusts discovery strategy (conservative/balanced/aggressive) based on live resource signals to avoid overloading managed services
- Batches metadata calls, reuses connections, and applies retry/backoff to handle provider throttling limits

6) Pooling and performance
- Initializes provider‑appropriate connection pools; integrates with PgBouncer for PostgreSQL backends
- Exposes pool metrics and allows runtime reconfiguration (pool size, overflow, timeouts) without service restarts

7) Observability and health
- Measures latency, error rates, and connection stability per data source
- Surfaces recommendations when cloud limits, throttling, or misconfigurations are detected

---

## How It’s Represented in `DataSource`

- `cloud_provider`: Declares the provider; drives connector selection
- `cloud_config`: Encodes provider‑specific auth/region settings (examples implemented in the model schema extra)
  - Azure: tenant/client IDs, client secret, managed identity flags
  - AWS: access key, secret key, region, IAM auth flag
  - GCP: service account and project bindings
- `ssl_config`: CA/cert/key paths or toggles for TLS
- `replica_config`: Replica endpoint(s) and set metadata (e.g., `replica_members`, `replica_set`)
- Pooling knobs (`pool_size`, `max_overflow`, `pool_timeout`) tuned per environment and provider constraints

These fields allow the backend to construct the exact connection behavior without exposing raw credentials in the entity itself.

---

## Role in End‑to‑End Flows

1) Registration and validation
- User registers a cloud data source with provider, region, endpoint, and auth in `cloud_config`
- Preflight and connection validation verify reachability, identity, and SSL correctness

2) Enterprise schema discovery
- Discovery adapts to cloud load, batches metadata retrieval, and reuses connections
- Results are normalized and pushed into the catalog (entities, columns, types, sizes, row counts)

3) Scanning, classification, and compliance
- Scan rule sets operate identically across providers
- Classification labels and sensitivity are derived from discovered structures and sampled metadata where allowed
- Compliance checks consume the same shapes (no cloud‑specific branching needed at the policy layer)

4) Catalog and lineage
- Discovered cloud assets are enriched and linked into lineage, business glossary, and quality metrics
- Incremental sync keeps cloud metadata current with minimal provider load

5) Monitoring and operations
- Health checks capture latency and error profiles that are typical of cloud services (e.g., transient throttling)
- Pool, cache, and query metrics guide right‑sizing and PgBouncer tuning for managed SQL engines

---

## Security Model and Secret Management

- Secrets are stored via the platform secret manager and referenced by `password_secret`
- Optional Fernet‑based encryption is supported for at‑rest protection using an app‑secret‑derived key
- For cloud‑native auth (IAM/Managed Identity/Service Accounts), `cloud_config` contains non‑password identity parameters; tokens are obtained by the connector at runtime
- RBAC sits above all routes; permission checks gate create/update/delete/validate/discover operations
- Full audit trail includes actor, action, timestamp, and result

---

## Relationships Across Modules

- With Connection Service: Cloud‑aware connectors translate `cloud_config` into provider‑specific connection args
- With Discovery: Adaptive strategies protect cloud backends from overload; outputs feed catalog
- With Catalog: Cloud assets are first‑class citizens with the same metadata structures and lineage
- With Classification: Provider‑agnostic labels and sensitivity applied to cloud columns and objects
- With Compliance: Policies evaluate cloud assets exactly like on‑prem assets using unified models
- With Scans/Rule Sets: Rules execute with provider‑appropriate limits, batching, and retries
- With RBAC: Provider operations are gated by fine‑grained permissions and audited
- With Racine Orchestration: Cloud sources participate in enterprise workflows, jobs, and dashboards

---

## Failure Modes and Resilience

- Transient errors: Retries with exponential backoff; connection re‑establishment
- Throttling/limits: Strategy downgrades (aggressive → balanced → conservative), batch size reduction, and delays
- Network/TLS issues: Clear diagnostics and recommendations (cert paths, endpoints, ports)
- Replica/primary failover: Hybrid connectors redirect to secondary when primaries are degraded

---

## Why This Matters

- A single governance plane for AWS, Azure, GCP, on‑prem, and hybrid
- Consistent policy, catalog, classification, and compliance regardless of provider
- Operational safety for cloud‑hosted databases via adaptive discovery and pooling
- Security by design with secrets isolation, TLS, and RBAC

---

## Practical Outcomes in PurSight

- Faster onboarding of cloud databases by filling `cloud_config`, `ssl_config`, and `replica_config`
- Reliable discovery under real‑world cloud constraints (latency, throttling)
- Production‑grade pooling and PgBouncer alignment for managed SQL services
- Uniform analytics and reporting across providers for leadership and auditors

---

## What to Show on Slides

- Single diagram: DataSource → Cloud‑Aware Connector → Discovery → Catalog → Classification/Compliance → Orchestration
- Callouts: IAM/Managed Identity/Service Accounts, TLS, replica awareness, adaptive discovery, pool metrics
- Impact: One governance model across AWS/Azure/GCP with enterprise security and performance