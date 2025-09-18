# Slide 1 — Compliance Rules System: Continuous, Automated, Enterprise-Grade

> Enforces SOC2, GDPR, HIPAA, PCI-DSS through policy rules linked to scans, catalog entities, and data sources.
> Delivers continuous evaluation, automated remediation workflows, and auditable compliance posture.

 > **What it is**: Central compliance engine with rules (type, severity, scope), evaluations, issues, and workflows

 > **Scopes**: Global, data-source, schema, table, column; filters by source type and metadata

 > **Automation**: Scheduled/on-change/manual triggers; auto-remediation and workflow handoff

> **Interlinks**: Scan results, Scan-Rule-Sets, Catalog entities, Classification labels, Data Sources

 > **Security & Audit**: RBAC-gated operations; full audit trail; multi-tenant org isolation

---

# Slide 2 — How It Works (Exact Backend Flow)

> Define rule → target scope → evaluate (uses scan/catalog context) → open issues/workflows → reports and alerts.
> Orchestrated by Racine for priorities/SLAs; metrics tracked (pass rate, scores, violations, remediation).

> **Rule definition**: condition/parameters, compliance standard refs, thresholds, alert conditions, remediation

> **Evaluation**: computes status and score; persists evaluations; updates/creates issues per entity

> **Issues & remediation**: severity, owners, due dates, plans/steps; accept risk or resolve; workflow linkage

> **Operations**: daily/weekly/monthly or on-change; safe retries; idempotent updates; health and alerts

> **Outcomes**: measurable pass rate, actionable gaps, traceable remediation, exportable reports



