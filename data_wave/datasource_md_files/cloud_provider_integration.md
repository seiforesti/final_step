# Cloud Provider Integration in Data Source Management

## Purpose and Scope

This document explains, in exact terms, how cloud provider integration is implemented in the backend for the Data Source Management module, how it interacts with other components, and the role it plays in the overall PurSight platform.

The explanations reflect the real implementation found in the backend services and models, without speculative features.

---

## What “Cloud Provider Integration” Means Here

- Cloud awareness is implemented at the connector/service layer to adapt connections and discovery to cloud, on-prem, and hybrid deployments.
- It focuses on:
  - Selecting location-aware connection behavior (ON_PREM, CLOUD, HYBRID)
  - Supplying cloud/SSL-specific connection arguments when in CLOUD/HYBRID
  - Handling hybrid primary/secondary initialization and failover
  - Supporting provider-aligned credential fields when present in connection properties

---

## Where It Is Implemented

- Location and cloud logic lives in the connection service layer:
  - `LocationAwareConnector` (base class)
  - Database-specific connectors (PostgreSQL, MySQL, MongoDB) built on top of the base connector
  - Cloud-aware connector variants are used by validation and connection orchestration
- Supporting validation uses these cloud-aware connectors during preflight connection checks

---

## How It Works – Key Mechanics

### 1) Location-Aware Behavior

- The data source carries a `location` value: `ON_PREM`, `CLOUD`, or `HYBRID`.
- `LocationAwareConnector.initialize()`:
  - HYBRID: initializes both a primary and a secondary connection and keeps a failover reference.
  - ON_PREM/CLOUD: initializes a single connection.
- `failover()` in HYBRID swaps the active and failover connections and tracks current role.

Why it matters: this allows the same connector logic to operate consistently across on-prem, cloud, and mixed deployments, and to switch over without changing consumer code.

### 2) Cloud Credentials and Arguments

- `_get_cloud_credentials()` reads cloud-relevant keys from `connection_properties.cloud_config` if present. Examples supported by current code paths include:
  - Azure-leaning fields for PostgreSQL (tenant/client/auth fields)
  - AWS-leaning fields for MySQL (access keys/region/IAM flag)
- `_get_connection_args()` adds connection arguments per location:
  - For `CLOUD`: enables `ssl` and forwards `ssl_ca`, `ssl_cert`, `ssl_key` from `connection_properties` when present.
  - For `HYBRID`: adds application naming and TCP keepalive oriented flags to support long-lived connections and identification.

Why it matters: the connector adapts the wire parameters to cloud networks (TLS/SSL) and hybrid conditions without changing business logic.

### 3) Password and Secrets Resolution (Cloud-Safe)

- Connectors never assume plaintext. They retrieve credentials via the service function chain:
  - Primary: secret manager lookup through the service layer
  - Fallbacks: fields in `connection_properties`/`additional_properties`
  - As a last resort, dynamic strategies (environment variables or tested patterns) are attempted
- If `use_encryption` is enabled at creation time (handled by the higher-level service), passwords are stored encrypted; connectors do not decrypt on their own and rely on the service to provide the usable secret.

Why it matters: this keeps cloud credentials out of code and ensures secure handling regardless of provider.

### 4) Cloud in Preflight Validation

- The preflight validation uses cloud-aware connector variants when testing user-submitted configurations.
- It builds a temporary data source object from the request payload and exercises the same production connection logic, with the password injected only for the preflight execution.

Why it matters: validation reports reflect the actual runtime connection behavior including SSL, performance, and diagnostics that will be used in production.

### 5) Discovery and Performance in Cloud Context

- PostgreSQL discovery leverages an enterprise discovery engine with resource monitoring and adaptive strategies (conservative/balanced/aggressive) irrespective of location.
- In CLOUD/HYBRID, the active connection arguments (TLS, keepalives) and batching policies apply to the same discovery flow, ensuring safe, resource-aware operation.

Why it matters: discovery, previews, and profiling operate with cloud-appropriate settings transparently.

---

## Provider Alignment (As Implemented)

The current code supports provider-aligned fields and behaviors via configuration rather than hard dependencies on provider SDKs.

- Azure-oriented keys (when present): `azure_tenant_id`, `azure_client_id`, `azure_client_secret`, `use_managed_identity`
- AWS-oriented keys (when present): `aws_access_key_id`, `aws_secret_access_key`, `aws_region`, `use_iam_auth`
- SSL provisioning (CLOUD/HYBRID): `ssl_ca`, `ssl_cert`, `ssl_key`

Notes:
- The presence of imports for provider SDKs is optional and code paths are guarded to work without them; the configuration pattern ensures decoupling.
- The connector reads these values from `connection_properties.cloud_config` (and related fields) when available; otherwise it proceeds with base connection behavior.

---

## Relationships and Interactions Across the Platform

### Data Source Model

- The model defines `location` (on_prem/cloud/hybrid), `cloud_provider`, and JSON fields for `cloud_config`, `replica_config`, and `ssl_config`.
- These fields flow into the connection service, which interprets them for connection arguments and initialization.

### Security / Secrets

- Secrets are managed by the service layer; connectors request secrets via a single service API.
- Encrypted-at-rest behavior is handled during create/update; connectors avoid dealing with raw encryption keys.

### Validation Service

- Uses cloud-aware connectors in preflight checks to return realistic diagnostics before persisting a data source.

### Discovery / Scan / Catalog

- Discovery uses the same connection settings and honors cloud/hybrid arguments transparently.
- Scan and catalog sync endpoints consume the discovery results and benefit from cloud-appropriate connection stability (SSL, keepalives) and hybrid failover behavior when configured.

### RBAC and Auditing

- All operations that exercise cloud connections still pass through the same RBAC gates and audit logging provided by the API layer.

---

## Role in the Project

- **Operational Consistency**: A single connector abstraction supports on-prem, cloud, and hybrid without branching logic in callers.
- **Security Posture**: Built-in SSL forwarding and secret resolution help meet cloud security expectations without custom code per provider.
- **Resilience**: HYBRID mode supports initializing primary/secondary and executing failover, improving availability for geographically or network-diverse deployments.
- **Deployability**: Cloud-related behavior is configuration-driven (fields and flags), simplifying deployment across environments without code changes.
- **Observability**: Preflight validation and enterprise discovery return concrete diagnostics for cloud connections, helping teams verify configurations early.

---

## Practical Configuration Flow

1) Define a data source with `location` and, if applicable, `cloud_provider`.
2) Provide `connection_properties` including `cloud_config` and any SSL files/paths (`ssl_ca`, `ssl_cert`, `ssl_key`) when using CLOUD/HYBRID.
3) Store credentials through the secret manager (optionally encrypted at rest) during creation.
4) Run preflight validation to receive diagnostics based on the same cloud-aware connectors used in production.
5) Persist and use the data source; scans, discovery, previews, and profiling will honor the configured cloud/hybrid settings automatically.

---

## Boundaries and Guarantees (Based on Code)

- No hard-coded provider coupling is required; connectors rely on configuration to enable cloud behaviors.
- SSL and keepalive arguments are applied only when `location` indicates CLOUD/HYBRID or when SSL-relevant properties exist.
- Failover is supported only in HYBRID; ON_PREM and CLOUD initialize a single connection.
- Secret decryption is not performed inside connectors; they depend on service-level retrieval for security.

---

## Summary

Cloud provider integration in the Data Source Management module is realized through location-aware connectors that:
- Interpret cloud-relevant fields and add SSL/keepalive arguments where appropriate
- Initialize primary/secondary connections for HYBRID and support failover
- Consume secrets via a secure service interface
- Feed the same cloud-adjusted connections into validation, discovery, scans, and catalog synchronization

This approach keeps cloud support robust, secure, and configuration-driven, while preserving a stable API surface for the rest of the platform.