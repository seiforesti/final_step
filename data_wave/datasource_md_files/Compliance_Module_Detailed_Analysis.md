# Compliance Rules System — Detailed Technical Analysis (No Code)

## Executive Summary
The Compliance Rules System provides continuous, automated assurance against frameworks such as SOC2, GDPR, HIPAA, and PCI‑DSS. It defines rules (type, severity, scope), evaluates them on governed assets, produces issues with remediation plans, and coordinates workflows. It integrates with scans, catalog, classification, RBAC, and the Racine orchestration layer to deliver a verifiable, auditable compliance posture.

---

## 1. Domain Model and Relationships

### 1.1 Core Entities
- **ComplianceRule**: Policy unit with business and technical definition.
  - Attributes: name/description, rule_type and severity, lifecycle status, scope (GLOBAL/DATA_SOURCE/SCHEMA/TABLE/COLUMN), tags and metadata.
  - Definition: condition, parameters, thresholds, alert conditions; references to standards (e.g., GDPR, SOX, HIPAA) and remediation guidance.
  - Targeting: data source filters and source type filters; optional linkage to ScanRuleSet and custom scan rules for policy‑driven scans.
  - Governance: organization ownership for multi‑tenancy; Racine orchestration linkage for enterprise workflows.
  - Metrics: pass_rate and entity counters for posture tracking.
- **ComplianceRuleEvaluation**: Result of evaluating a rule at a point in time.
  - Records status (compliant/non/partial/error), compliance_score, issues_found, execution_time, entities_processed, and contextual data (scan outcomes, security checks).
- **ComplianceIssue**: A tracked gap tied to a rule and optionally a specific entity or data source.
  - Attributes: severity, status lifecycle (open/in_progress/resolved/accepted_risk), remediation plan/steps, ownership, due dates, priority, dependencies, impacts, and audit stamps.

### 1.3 Scope semantics and resolution (GLOBAL/DATA_SOURCE/SCHEMA/TABLE/COLUMN)
Scopes determine the exact granularity where a rule is applied. The system resolves scope against catalog metadata and scan discoveries:

- **GLOBAL**: Applies platform‑wide to all organizations’ eligible assets (subject to tenant isolation). Use for universal policies like “PII must be encrypted at rest.”
- **DATA_SOURCE**: Applies to specific sources (e.g., one PostgreSQL instance). Targeted via many‑to‑many link or by `data_source_filters` (type, tags, criticality). Example: “Enable TLS for all connections to Production PostgreSQL.”
- **SCHEMA**: Applies to one or more schemas within targeted sources. Example: “Finance schemas must not contain unmasked PAN.”
- **TABLE**: Applies at table level. Example: “Access to `customers` table requires row‑level controls and quarterly reviews.”
- **COLUMN**: Applies to specific columns. Example: “Columns labeled PII must be AES‑256 encrypted and masked in non‑prod.”

Resolution rules and precedence:
- The engine first restricts by tenant/org, then by targeted data sources (links/filters), then by entity scope (schema/table/column).
- More specific scopes override or refine broader ones when both match (COLUMN > TABLE > SCHEMA > DATA_SOURCE > GLOBAL).
- Catalog and classification contexts supply the concrete entity lists (e.g., which columns are labeled PII) used to evaluate conditions.

### 1.2 Interconnections
- With Data Sources: Many‑to‑many mapping allows a rule to target one or more sources; filters constrain scope.
- With Scan Rule Sets and Scans: Rules can reference scan rule sets; evaluations can auto‑trigger scans or consume latest scan results for evidence.
- With Catalog: Scope resolves against catalog entities (schemas/tables/columns); lineage supports impact analysis.
- With Classification: Sensitivity labels inform rule conditions and risk weighting.
- With Racine: Orchestration coordinates evaluation waves, remediation workflows, SLAs, and priority; telemetry feeds scaling and retries.
- With RBAC: All operations are permission‑gated and auditable, supporting multi‑tenant isolation.

---

## 2. Lifecycle and Operations

### 2.1 Rule Authoring and Governance
- Define rule intent (standard, internal policy), map to severity and business impact.
- Choose scope and targeting (global, per source, per entity type); attach tags/metadata for discoverability.
- Configure condition/parameters, thresholds, alerting, remediation steps, and automation flags (e.g., auto_remediation, auto_scan_on_evaluation).
- Manage lifecycle: draft → active → under_review/deprecated.

### 2.2 Evaluation Execution
- Triggers: scheduled (daily/weekly/monthly), on‑change (e.g., catalog/schema changes), or manual.
- Context assembly: combine catalog entities, classification labels, and recent scan outcomes as evaluation input.
- Computation: determine status and compliance_score; aggregate entity counts (tables, columns, etc.).
- Persistence: store evaluation summary and context for auditability; update pass_rate on rule.
- Issue handling: create or update issues per entity difference; avoid duplication (idempotent updates) and assign ownership.

#### 2.4 End‑to‑end flow with scope
1) Select rule and resolve tenant/org context.
2) Resolve scope: GLOBAL → filter; or map to concrete data sources/schemas/tables/columns via catalog and classification.
3) Assemble evidence: latest scan results, entity metadata, sensitivity labels, and performance/security checks as required by the rule.
4) Evaluate condition and parameters per targeted entity; compute compliance_score and status.
5) Record evaluation; open/update issues for failing entities; attach remediation guidance and owners.
6) If configured, trigger remediation workflow or new scans; notify per alert conditions.

### 2.3 Remediation and Workflow
- Issue management: severity‑driven prioritization, assignment, due dates, remediation plan/steps, and progress tracking.
- Workflows: initiate remediation workflows with steps and approvals; link to SLAs and escalation policies via Racine.
- Outcomes: resolution (fixed) or accepted risk with justification; retest rules to verify closure.

---

## 3. Compliance Frameworks Implementation

### 3.1 SOC2 (Service Organization Control 2)
**Framework Context**: SOC2 focuses on security, availability, processing integrity, confidentiality, and privacy of customer data in cloud services.

**Project Implementation**:
- **Security Controls**: Rules enforce encryption at rest/transit, access controls, and audit logging across all data sources
- **Availability Monitoring**: Continuous health checks and uptime tracking for all governed databases and services
- **Processing Integrity**: Data lineage tracking ensures data transformations maintain accuracy and completeness
- **Confidentiality**: Classification system automatically identifies and protects sensitive data with appropriate access controls
- **Privacy**: PII detection and masking rules ensure customer data privacy across all environments

**Example Rules**: "All production databases must use TLS 1.3", "PII columns must be masked in non-production environments", "Database access must be logged and reviewed monthly"

### 3.2 GDPR (General Data Protection Regulation)
**Framework Context**: EU regulation protecting personal data privacy and giving individuals control over their data.

**Project Implementation**:
- **Data Discovery**: Automated scanning identifies all personal data across databases (names, emails, IDs, biometrics)
- **Consent Management**: Rules track data processing purposes and consent status
- **Right to Erasure**: Automated workflows for data deletion requests with lineage impact analysis
- **Data Portability**: Export capabilities for personal data in structured formats
- **Privacy by Design**: Default encryption and access controls for all personal data
- **Breach Notification**: Automated detection and alerting for unauthorized access to personal data

**Example Rules**: "Personal data must be encrypted with AES-256", "Data retention policies must be enforced", "Cross-border data transfers require additional safeguards"

### 3.3 HIPAA (Health Insurance Portability and Accountability Act)
**Framework Context**: US regulation protecting health information privacy and security.

**Project Implementation**:
- **PHI Identification**: AI-powered classification automatically identifies Protected Health Information (PHI)
- **Access Controls**: Role-based access with minimum necessary principle enforcement
- **Audit Trails**: Comprehensive logging of all PHI access and modifications
- **Encryption**: Mandatory encryption for PHI at rest and in transit
- **Business Associate Agreements**: Tracking and compliance monitoring for third-party data processors
- **Breach Detection**: Real-time monitoring for unauthorized PHI access or disclosure

**Example Rules**: "PHI must be encrypted with FIPS 140-2 validated modules", "Access to PHI must be logged and reviewed quarterly", "PHI cannot be stored in non-HIPAA compliant cloud regions"

### 3.4 PCI-DSS (Payment Card Industry Data Security Standard)
**Framework Context**: Security standards for organizations handling credit card data.

**Project Implementation**:
- **Cardholder Data Discovery**: Automated detection of PAN, CVV, expiration dates, and magnetic stripe data
- **Network Segmentation**: Rules ensure cardholder data environments are isolated from other networks
- **Access Control**: Multi-factor authentication and role-based access for cardholder data
- **Encryption**: Strong encryption for cardholder data storage and transmission
- **Vulnerability Management**: Regular security scanning and patch management
- **Monitoring**: Continuous monitoring of cardholder data access and network traffic

**Example Rules**: "PAN must be masked except for last 4 digits", "Cardholder data must be encrypted with AES-256", "Access to cardholder data must be logged and monitored 24/7"

### 3.5 Framework Integration in Project Architecture
**Unified Compliance Engine**: All frameworks are implemented through the same ComplianceRule model with framework-specific parameters and conditions.

**Cross-Framework Mapping**: Rules can reference multiple frameworks (e.g., a data encryption rule satisfies both SOC2 and HIPAA requirements).

**Automated Assessment**: The system automatically evaluates compliance posture against all applicable frameworks and generates framework-specific reports.

**Remediation Workflows**: Framework-specific remediation steps and approval processes ensure compliance gaps are addressed according to each standard's requirements.

---

## 4. Monitoring, Metrics, and Reporting

- Posture metrics: pass_rate, total/passing/failing entities, violations by severity and standard.
- Evaluation KPIs: execution time, entities processed, error rates.
- Issue analytics: open vs resolved, mean time to remediation, overdue items, dependency blocks.
- Alerting: threshold‑based notifications on score drops, spikes in violations, missed SLAs.
- Reports: framework‑specific summaries (SOC2/GDPR/HIPAA/PCI‑DSS), audit‑ready exports with timestamps and user context.

---

## 4. Security, Multi‑Tenancy, and Audit

- RBAC: Fine‑grained permissions for rules, evaluations, issues, workflows, and reports.
- Isolation: organization scoping for all entities; cross‑tenant data access prevented.
- Audit trail: every change/action records user, time, and details; supports external audits.
- Data protection: conditions and targets leverage classification context; sensitive data handling enforced by policy.

---

## 5. Orchestration and Reliability

- Racine orchestration: plans evaluation campaigns, sequences prerequisite scans, and scales execution based on health/telemetry.
- Resilience: safe retries, partial evaluation marking, and recovery paths to avoid blocking pipelines.
- Performance: batch evaluation where possible; incremental re‑checks on changed entities to control cost.

---

## 6. Outcomes and Value

- Continuous, evidence‑backed compliance aligned to industry frameworks.
- Rapid detection of gaps with actionable remediation pathways and measurable closure.
- Executive‑level posture metrics with drill‑down to entity‑level evidence.

---

## 7. Presenter Talking Points (Quick Reference)

- Rules are first‑class: typed, scoped, measurable, and linked to scans/catalog/classification.
- Evaluations produce scores and open issues automatically; remediation is workflow‑driven.
- Racine orchestrates at scale with SLAs and priorities; RBAC and audit ensure governance.


