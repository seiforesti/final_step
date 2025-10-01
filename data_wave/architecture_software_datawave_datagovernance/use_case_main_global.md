# DataWave – Main Global Use Case Diagram (Enterprise Strict Layout)

```mermaid
---
config:
  theme: base
  layout: elk
---
flowchart LR
 subgraph M_DS["📡 Data Source"]
    direction TB
        UC_DS_REG(("Register Data Source"))
        UC_DS_AUTH(("Secrets & Auth Mgmt"))
        UC_DS_TEST(("Test Connectivity"))
        UC_DS_DISC(("Discover Schema"))
        UC_DS_EDGE(("Edge Deploy / Local AI"))
        UC_DS_SYNC(("Metadata Sync / Incremental"))
        UC_DS_HEALTH(("Health / Heartbeats"))
        UC_DS_ROTATE(("Credential Rotation"))
        UC_DS_OFFBOARD(("Decommission / Offboarding"))
  end
 subgraph M_CAT["📚 Catalog"]
    direction TB
        UC_CAT_INGEST(("Ingest Assets"))
        UC_CAT_SEARCH(("Semantic Search"))
        UC_CAT_GLOSS(("Business Glossary"))
        UC_CAT_LINE(("Lineage View"))
        UC_CAT_QUAL(("Quality Assessment"))
        UC_CAT_BULK(("Bulk Ops / Tagging"))
        UC_CAT_MON(("Realtime Monitoring"))
  end
 subgraph M_CLASS["🏷️ Classification"]
    direction TB
        UC_CL_DICT(("Manage Dictionaries"))
        UC_CL_NLP(("NLP Patterns"))
        UC_CL_ML(("ML Classifiers"))
        UC_CL_AUTO(("Auto Classification"))
        UC_CL_MAN(("Manual Classification"))
        UC_CL_REVIEW(("Review / Conflicts"))
        UC_CL_ATTEST(("Attestation / Sign-off"))
  end
 subgraph M_RULES["📋 Scan Rule Sets"]
    direction TB
        UC_RS_TPL(("Create Rule Template"))
        UC_RS_LIB(("Template Library"))
        UC_RS_VER(("Version / Tag"))
        UC_RS_DIFF(("Compare / Diff"))
        UC_RS_TEST(("Dry-run / Validate"))
        UC_RS_PUB(("Publish / Rollout"))
        UC_RS_RBK(("Rollback / Freeze"))
  end
 subgraph M_SCAN["🔍 Scan Logic"]
    direction TB
        UC_SC_STRAT(("Select Strategy – seq/parallel/adaptive"))
        UC_SC_WORK(("Workflow Stages"))
        UC_SC_SCHED(("Schedule / Cron"))
        UC_SC_TRIG(("Event / Dependency Trigger"))
        UC_SC_EXEC(("Execute / Control – start/pause/resume"))
        UC_SC_RES(("Resource Mgmt / Quotas"))
        UC_SC_AI(("AI Optimization / Prediction"))
        UC_SC_OBS(("Telemetry / Tracing / Alerts"))
  end
 subgraph M_COMP["⚖️ Compliance"]
    direction TB
        UC_CP_FW(("Register Frameworks – GDPR/HIPAA/SOX"))
        UC_CP_CTRL(("Define Controls"))
        UC_CP_MAP(("Map Controls to Assets"))
        UC_CP_ASS(("Assess / Plan / Tests"))
        UC_CP_EVID(("Collect Evidence"))
        UC_CP_RISK(("Risk Register / DPIA"))
        UC_CP_REP(("Regulatory Reports"))
        UC_CP_REMED(("Remediation Workflow"))
  end
 subgraph M_RBAC["🔐 RBAC / Access Control"]
    direction TB
        UC_R_ID(("Identity Provisioning"))
        UC_R_OAUTH(("OAuth Providers – Google/Microsoft/Email"))
        UC_R_MFA(("MFA / Step-up"))
        UC_R_ROLE(("Roles / Inheritance"))
        UC_R_PERM(("Permissions / Scopes"))
        UC_R_ABAC(("ABAC Conditions"))
        UC_R_CHECK(("Check / Require Permission"))
        UC_R_REQ(("Access Request / Approval"))
        UC_R_DENY(("Deny Assignments"))
        UC_R_AUD(("RBAC Audit / Evidence"))
  end
 subgraph M_OBS["📈 Observability"]
    direction TB
        UC_OBS_MET(("Metrics / KPIs"))
        UC_OBS_LOG(("Logs / Correlation IDs"))
        UC_OBS_TR(("Tracing"))
        UC_OBS_SLO(("SLO / Error Budgets"))
        UC_OBS_INC(("Incidents / Alerts"))
  end
 subgraph M_COST["💰 FinOps"]
    direction TB
        UC_COST_BUD(("Budgets / Quotas"))
        UC_COST_ALLOC(("Allocation / Chargeback"))
        UC_COST_FORE(("Forecasting"))
        UC_COST_OPT(("Optimization"))
  end
 subgraph M_SEC["🛡️ Security & Audit"]
    direction TB
        UC_SEC_POL(("Security Policies"))
        UC_SEC_VULN(("Vulnerability Mgmt"))
        UC_SEC_DLP(("DLP / Masking / Tokenization"))
        UC_SEC_AUD(("Platform Audit / Evidence"))
  end
 subgraph M_INT["🔗 Integrations"]
    direction TB
        UC_INT_WS(("Webhooks / Events"))
        UC_INT_API(("API / SDK"))
        UC_INT_ETL(("ETL Connectors"))
        UC_INT_IDP(("IdP / SSO"))
  end
 subgraph SYSTEM["🧩 DataWave Enterprise Data Governance System"]
    direction TB
        M_DS
        M_CAT
        M_CLASS
        M_RULES
        M_SCAN
        M_COMP
        M_RBAC
        M_OBS
        M_COST
        M_SEC
        M_INT
        G_DS["Guard: TLS-only; secret vault; IP allowlists; zero-trust edge"]
        G_CAT["Guard: Curated glossary; change control; lineage immutability"]
        G_CL["Guard: Thresholds; bias checks; manual override for critical"]
        G_RS["Guard: Protected branches; CODEOWNERS; staged rollout"]
        G_SC["Guard: Concurrency limits; SLA caps; budget enforcement"]
        G_CP["Guard: SoD; evidence immutability; retention SLAs"]
        G_RB["Guard: Least-privilege; deny-by-default; ABAC centrally managed"]
        G_OBS["Guard: PII scrubbing; correlation IDs; incident runbooks"]
        G_COST["Guard: Quotas per tenant; alerts on overspend; freeze rules"]
        G_SEC["Guard: Hashing; tamper-evident logs; break-glass tracked"]
  end
    UC_DS_REG -- «include» --> UC_DS_AUTH
    UC_DS_AUTH -- «include» --> UC_DS_TEST
    UC_DS_TEST -- «include» --> UC_DS_DISC
    UC_DS_DISC -- «include» --> UC_DS_EDGE & UC_CAT_INGEST
    UC_DS_EDGE -- «include» --> UC_DS_SYNC
    UC_DS_SYNC -- «include» --> UC_DS_HEALTH
    UC_CAT_INGEST -- «include» --> UC_CAT_GLOSS
    UC_CAT_GLOSS -- «include» --> UC_CAT_SEARCH
    UC_CAT_SEARCH -- «include» --> UC_CAT_LINE
    UC_CAT_LINE -- «include» --> UC_CAT_QUAL
    UC_CAT_QUAL -- «include» --> UC_CAT_MON & UC_CP_RISK
    UC_CL_DICT -- «include» --> UC_CL_NLP & UC_CL_ML
    UC_CL_AUTO -- «include» --> UC_CL_REVIEW & UC_CAT_INGEST
    UC_CL_MAN -- «include» --> UC_CL_REVIEW
    UC_CL_REVIEW -- «include» --> UC_CL_ATTEST
    UC_RS_TPL -- «include» --> UC_RS_LIB
    UC_RS_LIB -- «include» --> UC_RS_VER
    UC_RS_VER -- «include» --> UC_RS_DIFF
    UC_RS_TEST -- «include» --> UC_RS_PUB
    UC_SC_STRAT -- «include» --> UC_SC_WORK
    UC_SC_WORK -- «include» --> UC_SC_EXEC
    UC_SC_SCHED -- «include» --> UC_SC_EXEC
    UC_SC_TRIG -- «include» --> UC_SC_EXEC
    UC_SC_RES -- «include» --> UC_SC_OBS
    UC_SC_AI -- «include» --> UC_SC_OBS
    UC_CP_FW -- «include» --> UC_CP_CTRL
    UC_CP_CTRL -- «include» --> UC_CP_MAP
    UC_CP_ASS -- «include» --> UC_CP_EVID
    UC_CP_RISK -- «include» --> UC_CP_REP
    UC_R_ID -- «include» --> UC_R_OAUTH
    UC_R_OAUTH -- «include» --> UC_R_MFA
    UC_R_ROLE -- «include» --> UC_R_PERM
    UC_R_PERM -- «include» --> UC_R_CHECK
    UC_R_ABAC -- «include» --> UC_R_CHECK
    UC_R_REQ -- «include» --> UC_R_AUD
    UC_OBS_MET -- «include» --> UC_OBS_SLO
    UC_OBS_LOG -- «include» --> UC_OBS_TR
    UC_OBS_TR -- «include» --> UC_OBS_INC
    UC_COST_BUD -- «include» --> UC_COST_ALLOC & UC_R_CHECK
    UC_COST_FORE -- «include» --> UC_COST_OPT
    UC_SEC_POL -- «include» --> UC_SEC_AUD
    UC_SEC_DLP -- «include» --> UC_SEC_AUD
    UC_INT_API -- «include» --> UC_INT_WS
    UC_INT_ETL -- «include» --> UC_INT_API
    UC_RS_PUB -. «extend» .-> UC_RS_RBK
    UC_SC_EXEC -. «extend» .-> UC_SC_RES & UC_SC_AI
    UC_CP_REP -. «extend» .-> UC_CP_REMED
    UC_R_CHECK -. «extend» .-> UC_R_DENY
    UC_R_REQ -. «extend» .-> UC_R_DENY
    UC_SEC_POL -. «extend» .-> UC_SEC_DLP
    UC_CL_ATTEST -- «include» --> UC_CAT_BULK
    UC_RS_PUB -- «include» --> UC_SC_WORK
    UC_SC_EXEC -- «include» --> UC_CP_ASS
    UC_SC_OBS -- «include» --> UC_OBS_MET
    UC_CP_EVID -- «include» --> UC_SEC_AUD
    UC_R_CHECK -- «include» --> UC_SEC_AUD & UC_OBS_LOG
    UC_INT_IDP -- «include» --> UC_R_OAUTH
    UC_DS_REG --- G_DS
    UC_CAT_INGEST --- G_CAT
    UC_CL_AUTO --- G_CL
    UC_RS_PUB --- G_RS
    UC_SC_EXEC --- G_SC
    UC_CP_EVID --- G_CP
    UC_R_CHECK --- G_RB
    UC_OBS_LOG --- G_OBS
    UC_COST_BUD --- G_COST
    UC_SEC_AUD --- G_SEC
    A_ADMIN["&lt;&gt;\n👨‍💼 Data Administrator"] --- UC_DS_REG & UC_CAT_INGEST & UC_R_ROLE & UC_R_PERM
    A_STEWARD["&lt;&gt;\n👩‍💼 Data Steward"] --- UC_CAT_GLOSS & UC_CL_MAN & UC_CL_REVIEW
    A_ANALYST["&lt;&gt;\n👨‍🔬 Data Analyst"] --- UC_CAT_SEARCH & UC_CAT_LINE & UC_CL_AUTO
    A_PRIV["&lt;&gt;\n🛡️ Privacy Officer"] --- UC_CP_RISK
    A_COMP["&lt;&gt;\n👩‍⚖️ Compliance Officer"] --- UC_CP_ASS
    A_SRE["&lt;&gt;\n🛠️ SRE / Platform Engineer"] --- UC_SC_RES & UC_OBS_INC
    A_DEV["&lt;&gt;\n👨‍💻 Developer / Integrator"] --- UC_RS_TPL & UC_INT_API
    R_OWNER["&lt;&gt;\n👤 Asset Owner"] --- UC_R_REQ
    R_AUD["&lt;&gt;\n👩‍📊 Auditor"] --- UC_SEC_AUD
    R_CISO["&lt;&gt;\n🧑‍💼 CISO / Security Lead"] --- UC_SEC_POL
    R_BIZ["&lt;&gt;\n🏢 Business Stakeholder"] --- UC_COST_FORE
    R_SYS["&lt;&gt;\n🧠 System Services"] --- UC_INT_WS
     UC_DS_REG:::uc
     UC_DS_AUTH:::uc
     UC_DS_TEST:::uc
     UC_DS_DISC:::uc
     UC_DS_EDGE:::uc
     UC_DS_SYNC:::uc
     UC_DS_HEALTH:::uc
     UC_DS_ROTATE:::uc
     UC_DS_OFFBOARD:::uc
     UC_CAT_INGEST:::uc
     UC_CAT_SEARCH:::uc
     UC_CAT_GLOSS:::uc
     UC_CAT_LINE:::uc
     UC_CAT_QUAL:::uc
     UC_CAT_BULK:::uc
     UC_CAT_MON:::uc
     UC_CL_DICT:::uc
     UC_CL_NLP:::uc
     UC_CL_ML:::uc
     UC_CL_AUTO:::uc
     UC_CL_MAN:::uc
     UC_CL_REVIEW:::uc
     UC_CL_ATTEST:::uc
     UC_RS_TPL:::uc
     UC_RS_LIB:::uc
     UC_RS_VER:::uc
     UC_RS_DIFF:::uc
     UC_RS_TEST:::uc
     UC_RS_PUB:::uc
     UC_RS_RBK:::uc
     UC_SC_STRAT:::uc
     UC_SC_WORK:::uc
     UC_SC_SCHED:::uc
     UC_SC_TRIG:::uc
     UC_SC_EXEC:::uc
     UC_SC_RES:::uc
     UC_SC_AI:::uc
     UC_SC_OBS:::uc
     UC_CP_FW:::uc
     UC_CP_CTRL:::uc
     UC_CP_MAP:::uc
     UC_CP_ASS:::uc
     UC_CP_EVID:::uc
     UC_CP_RISK:::uc
     UC_CP_REP:::uc
     UC_CP_REMED:::uc
     UC_R_ID:::uc
     UC_R_OAUTH:::uc
     UC_R_MFA:::uc
     UC_R_ROLE:::uc
     UC_R_PERM:::uc
     UC_R_ABAC:::uc
     UC_R_CHECK:::uc
     UC_R_REQ:::uc
     UC_R_DENY:::uc
     UC_R_AUD:::uc
     UC_OBS_MET:::uc
     UC_OBS_LOG:::uc
     UC_OBS_TR:::uc
     UC_OBS_SLO:::uc
     UC_OBS_INC:::uc
     UC_COST_BUD:::uc
     UC_COST_ALLOC:::uc
     UC_COST_FORE:::uc
     UC_COST_OPT:::uc
     UC_SEC_POL:::uc
     UC_SEC_VULN:::uc
     UC_SEC_DLP:::uc
     UC_SEC_AUD:::uc
     UC_INT_WS:::uc
     UC_INT_API:::uc
     UC_INT_ETL:::uc
     UC_INT_IDP:::uc
     G_DS:::note
     G_CAT:::note
     G_CL:::note
     G_RS:::note
     G_SC:::note
     G_CP:::note
     G_RB:::note
     G_OBS:::note
     G_COST:::note
     G_SEC:::note
     A_ADMIN:::actor
     A_STEWARD:::actor
     A_ANALYST:::actor
     A_PRIV:::actor
     A_COMP:::actor
     A_SRE:::actor
     A_DEV:::actor
     R_OWNER:::actor
     R_AUD:::actor
     R_CISO:::actor
     R_BIZ:::actor
     R_SYS:::actor
    classDef actor fill:#eef2ff,stroke:#1e3a8a,stroke-width:1.5px
    classDef uc fill:#fff7ed,stroke:#9a3412,stroke-width:1.5px
    classDef note fill:#ecfeff,stroke:#0891b2,stroke-width:1px
    style M_DS fill:#BBDEFB
    style M_CAT fill:#E1BEE7
    style M_CLASS fill:#C8E6C9
    style M_RULES fill:#FFE0B2
    style M_SCAN fill:#FFF9C4
    style M_COMP fill:#FFCDD2
    style M_RBAC fill:#FFD600
