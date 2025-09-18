# Cloud-Aware Data Source Integration – Exact Backend Behavior

This document explains, in concrete terms, how cloud provider integration is modeled, initialized, secured, validated, and used across the PurSight backend for the Data Source Management module. It is based on the project’s actual models and services.

---

## 1) What “cloud provider integration” means in PurSight

- A data source can be attached to a specific cloud context via:
  - Provider: one of AWS, Azure, or GCP.
  - Location: on_prem, cloud, or hybrid.
  - Cloud configuration: provider-specific keys (e.g., region, tenant, client, identity mode).
  - Replica and SSL configuration: JSON fields for failover and TLS material.
- The provider and location directly influence how the connector builds connection parameters, how TLS is applied, and how failover/routing is handled for discovery and scans.

---

## 2) Where this is represented in the backend (data model level)

- The `DataSource` entity contains explicit fields used by the services and connectors:
  - `cloud_provider`: identifies AWS/Azure/GCP.
  - `cloud_config`: JSON object for provider-specific credentials and options (examples visible in the model’s schema extra):
    - Azure keys often include `tenant_id`, `client_id`, `client_secret`, `use_managed_identity` and optional SSL cert paths.
    - AWS keys often include `access_key_id`, `secret_access_key`, `region`, `use_iam_auth`.
  - `replica_config`: JSON object for hybrid/replica routing (e.g., `replica_host`, `replica_port`, `replica_set`, `replica_members`).
  - `ssl_config`: JSON object to carry TLS assets (e.g., `ssl_ca`, `ssl_cert`, `ssl_key`).
  - `location`: `on_prem`, `cloud`, or `hybrid`, which switches connector behavior.

Impact: The model is the single source of truth for cloud identity, TLS, and routing decisions.

---

## 3) How connections are built for cloud and hybrid

- URI construction is dynamic. The backend builds the base connection URI per source type.
- When `location` is `cloud` or `hybrid` and `ssl_config` exists, TLS parameters are appended to the URI as query parameters (e.g., CA/cert/key paths), ensuring in‑transit encryption.
- For MongoDB hybrid with a replica set, multiple members from `replica_config` are joined into a comma‑separated hosts list, and the replica set name is appended.
- Provider‑specific connection arguments are derived from `cloud_config` by the connector, e.g., IAM/Managed Identity versus static secrets.

Result: The same high‑level API builds provider‑correct, TLS‑hardened connection strings without hardcoding per provider.

---

## 4) Location‑aware connector responsibilities

- The connector logic (location‑aware pattern) reads: `cloud_provider`, `cloud_config`, `replica_config`, `ssl_config`, and `location`.
- Key behaviors:
  - Primary/secondary initialization for `hybrid` sources, enabling failover across on‑prem and cloud endpoints.
  - Application of cloud authentication modes:
    - Azure: option to use Managed Identity or client credentials.
    - AWS: option to use IAM auth or static keys.
    - GCP: option to use service account flows.
  - Assembly of secure connection args (timeouts, TLS, pool sizing) appropriate to managed services.

Effect: The connector becomes cloud‑aware without changing call sites in services or routes.

---

## 5) Updating and validating cloud settings (service layer)

- Updates: `update_data_source_cloud_config(...)` persists `cloud_provider`, `cloud_config`, `replica_config`, and `ssl_config` atomically on the `DataSource` record.
- Validation: `validate_connection(...)` constructs a real connection from the stored configuration and executes a lightweight query/ping, returning a success flag and message.
- Health: `get_data_source_health(...)` measures latency and inspects error patterns; it returns a status, recommendations, and metric snapshots (e.g., uptime, error rate, active connections, storage usage when available).
- Stats: `get_data_source_stats(...)` aggregates discovered asset metadata and computes classification/sensitivity/compliance/performance summaries reflecting the actual cloud database.

Outcome: Cloud settings are not static metadata; they are exercised and validated by live connection checks and stats collection.

---

## 6) Secrets, credentials, and encryption

### TLS/SSL specifics (by engine)
- PostgreSQL: `sslmode=require|verify-ca|verify-full` chosen based on presence of CA and hostname validation; SNI supported by drivers. CA/cert/key paths from `ssl_config` are appended to the DSN.
- MySQL: `ssl_ca`, `ssl_cert`, `ssl_key` parameters included in the URI when provided; server cert validation follows the CA chain.
- MongoDB: TLS is enabled with CA file, and the driver validates the server certificate chain; options are appended to the URI.

### Certificate management guidance
- Rotation: replace cert files referenced by `ssl_config` and recycle pools; prefer stable symlink paths to avoid model churn.
- Private endpoints: ensure CN/SAN matches the DNS name used by connectors; keep provider CA bundles up to date.



- Credential reference: `password_secret` on the data source points to the secret store.
- Retrieval: secrets are fetched via the project’s secret manager. If `use_encryption` is enabled, encryption/decryption is applied using Fernet with keys derived from application secrets.
- Fallbacks: if secrets are unavailable, the service checks `connection_properties` / `additional_properties`, environment variables, and (as a last resort for tests) pattern‑based attempts validated with real connection probes.
- TLS: cloud/hybrid with `ssl_config` appends CA/cert/key paths into the connection string, enforcing encryption in transit.

Guarantee: Credentials are never persisted as plain text in the `DataSource` table; TLS is enforced by configuration when applicable.

---

## 7) Discovery and scanning with cloud sources

- Enterprise schema discovery uses an adaptive strategy engine that:
  - Chooses conservative/balanced/aggressive modes based on observed load and error rates.
  - Batches table metadata queries and reuses connections to avoid exhausting cloud connection limits.
  - Tracks metrics like tables discovered, queries executed, retries, and cache hit rate.
  - Performs explicit connection cleanup/disposal to prevent lingering connections against managed cloud databases.
- Scans and rule sets leverage the same connection context, benefiting from TLS, failover routing, and provider‑correct authentication.

Value: Safe, resource‑aware operation against managed cloud services with automatic backoff and cleanup.

---

## 8) Cross‑module relationships and governance impact

- Catalog: Discovered cloud schemas/tables/columns are synchronized into catalog items with provider/location context.
- Classification: Sensitivity labels and classification outcomes are attached to assets discovered from cloud sources.
- Compliance: Provider/location and TLS posture feed into compliance scoring and violation tracking.
- RBAC/Audit: All cloud operations are permission‑gated and logged with user/action context.
- Orchestration: Racine workflows use `location`/provider to plan execution, including hybrid failover paths and resource‑aware scheduling.

Translation: Cloud context is first‑class across the platform’s governance lifecycle.

---

## 9) Hybrid and replica routing

### Replica configuration model
- `replica_config.replica_host` / `replica_port`: designates a read replica (relational engines) when present.
- `replica_config.replica_set`: the replica set name for document stores (e.g., MongoDB).
- `replica_config.replica_members`: array of host:port entries; connectors build a comma‑separated host list for the URI.
- Health attributes (optional in config or derived from runtime): last‑applied lag, error rate, and reachability; used to avoid stale or broken replicas.

### Read routing policy (service behavior)
- Primary‑only operations: DDL discovery, compliance validations requiring guaranteed freshness.
- Replica‑eligible operations: table previews, profile reads, and statistics, when staleness window is acceptable.
- Failover: if primary latency/error thresholds are exceeded, connectors switch to replica endpoints with exponential backoff and cool‑down to prevent flapping.

### MongoDB specifics
- Connection string includes `replicaSet=<name>` and all `replica_members`.
- Read preference defaults to `primaryPreferred` for correctness during discovery; can use `secondaryPreferred` for heavy read‑only analytics if allowed by policy.

### Relational cloud replicas
- AWS RDS/Aurora readers, Azure SQL readable secondaries, and GCP Cloud SQL read replicas are addressed through `replica_host`/`replica_port` or provider‑specific endpoints stored in `replica_config`.
- Routing respects write‑intent vs read‑intent to protect transactional correctness.



- `replica_config` enables specifying replica endpoints and set names (e.g., MongoDB), allowing:
  - Read scaling and resiliency for discovery/scan operations.
  - Seamless failover to secondary endpoints if the primary is degraded.
- The connector determines when to route to primary vs replica based on configuration and health feedback.

Benefit: Higher availability and better performance under load for cloud‑hosted and hybrid deployments.

---

## 10) Operational safeguards and observability

- Pooling: Connection pool sizes/timeouts are tuned for cloud contexts; with PostgreSQL, PgBouncer multiplexing is leveraged upstream.
- Health and stats endpoints expose latency, error messages, uptime, cache ratios (when supported), and size estimates or real sizes for supported engines.
- Discovery metrics: duration, tables/schemas discovered, queries executed, retries, error counts, and cache‑hit rates give precise visibility.
- Recommendations: Health responses include actionable guidance (optimize network/SSL, adjust pool sizes, investigate high error rates, etc.).

Result: Operators have the telemetry needed to keep cloud data sources reliable and efficient.

---

## 11) Security and compliance posture

- In‑transit encryption via `ssl_config` for cloud/hybrid.
- At‑rest protection via secret manager and optional Fernet encryption.
- Permission checks on every route manipulating or reading data source internals.
- Comprehensive audit logging of user, operation, timestamp, and result.

Outcome: Provider‑agnostic but enterprise‑grade security aligned with governance requirements.

---

## 12) Practical example scenarios (how it plays out)

- Azure SQL in cloud:
  - `cloud_provider=azure`, `location=cloud`, `cloud_config` contains tenant/client and `use_managed_identity`.
  - `ssl_config` adds TLS cert paths; the connector supplies MSI or client credentials; validation runs a real ping/SELECT; discovery uses conservative/balanced strategies depending on load.
- AWS RDS PostgreSQL in hybrid:
  - `cloud_provider=aws`, `location=hybrid`, `replica_config` populated for read replicas.
  - PgBouncer multiplexing upstream; failover to replica if primary is slow; TLS enforced via CA; health reports latency and recommendations.

These flows are fully driven by the `DataSource` record—no per‑provider code branching in call sites.

---

## 13) KPIs and expected outcomes

- Secure connectivity: TLS on by default for cloud/hybrid when `ssl_config` is present.
- Reliable operation: Connection reuse, adaptive discovery, and failover minimize disruption.
- Efficient scans: Batching and caching reduce queries and cost against managed services.
- Governance alignment: Provider/location context flows into catalog, classification, and compliance analytics.

---

## 14) Summary (one paragraph)

Cloud provider integration in PurSight is model‑driven and connector‑aware: each data source encodes its provider, identity, TLS, and routing posture; services validate and monitor live connections; discovery/scans adapt to managed cloud constraints; and the full governance stack (catalog, classification, compliance, RBAC, audit, orchestration) consumes this context. The result is a unified, secure, and resilient experience across AWS, Azure, and GCP—on‑prem, cloud, and hybrid alike.
