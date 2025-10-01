# Use Case – RBAC / Access Control Module (Enterprise Use Case Layout)

```mermaid
%%{init: {'theme': 'base'}}%%
flowchart LR
    %% ================= Actors (Left Side) =================
    A_ADMIN["<<actor>>\n👨‍💼 IAM Administrator"]:::actor
    A_OWNER["<<actor>>\n👤 Resource Owner"]:::actor
    A_USER["<<actor>>\n🧑 End User / Analyst"]:::actor

    %% ================= Actors (Right Side) =================
    R_AUD["<<actor>>\n👩‍📊 Auditor"]:::actor
    R_SEC["<<actor>>\n🛡️ Security / SOC"]:::actor
    R_SYS["<<actor>>\n🧠 System Services"]:::actor

    %% ================= System Boundary =================
    subgraph SYSTEM["🔐 RBAC / Access Control System"]
    direction TB

      %% -------- Identity & AuthN --------
      UC_PROV((User/Group Provisioning)):::uc
      UC_OAUTH((OAuth Providers – Google, Microsoft, Email)):::uc
      UC_MFA((MFA / Step-up Auth)):::uc
      UC_SESS((Session / Token Mgmt)):::uc
      UC_APIK((API Keys / Rotation)):::uc

      %% -------- Roles & Permissions --------
      UC_ROLE((Create Roles / Scopes)):::uc
      UC_PERM((Define Permissions)):::uc
      UC_INH((Role Inheritance)):::uc
      UC_GRP((Groups / Team Mgmt)):::uc
      UC_BIND((Bind Roles to Resources)):::uc

      %% -------- ABAC / Conditions --------
      UC_ATTR((Condition Templates)):::uc
      UC_ABAC((Attribute Checks / Policies)):::uc
      UC_CTX((Context (time, region, dept))):::uc

      %% -------- Authorization Checks --------
      UC_CHECK((Check Permission)):::uc
      UC_REQUIRE((Require Permissions)):::uc
      UC_POLENF((Policy Enforcement Points)):::uc

      %% -------- Delegation & Access Review --------
      UC_REQ((Access Request Workflow)):::uc
      UC_APPR((Approval / SoD)):::uc
      UC_REVIEW((Periodic Access Review)):::uc
      UC_DELEG((Delegation / Time-bound Access)):::uc

      %% -------- Deny & Exceptions --------
      UC_DENY((Deny Assignments)):::uc
      UC_EXC((Exception / Break-glass)):::uc

      %% -------- Audit & Monitoring --------
      UC_AUDIT((RBAC Audit Log / Evidence)):::uc
      UC_CORR((Correlation IDs / Tracing)):::uc
      UC_ALERTS((Alerts / Anomalies)):::uc
      UC_WS((WebSocket Real-time Updates)):::uc

      %% -------- Includes --------
      UC_OAUTH -->|«include»| UC_MFA
      UC_SESS -->|«include»| UC_APIK

      UC_ROLE -->|«include»| UC_PERM
      UC_ROLE -->|«include»| UC_INH
      UC_GRP -->|«include»| UC_ROLE

      UC_ATTR -->|«include»| UC_ABAC
      UC_ABAC -->|«include»| UC_CTX

      UC_REQUIRE -->|«include»| UC_CHECK
      UC_POLENF -->|«include»| UC_REQUIRE

      UC_REQ -->|«include»| UC_APPR
      UC_REVIEW -->|«include»| UC_REQ

      UC_EXC -->|«include»| UC_DELEG

      UC_AUDIT -->|«include»| UC_CORR
      UC_CORR -->|«include»| UC_ALERTS
      UC_WS -->|«include»| UC_ALERTS

      %% -------- Extends --------
      UC_DENY -.->|«extend»| UC_BIND
      UC_EXC -.->|«extend»| UC_REQUIRE

      %% -------- Guards / Notes --------
      G_AUTH["Guard: Strong auth; phishing-resistant MFA; token binding"]:::note
      G_RBAC["Guard: Least-privilege; deny by default; change control"]:::note
      G_ABAC["Guard: ABAC conditions centrally managed; timeboxed overrides"]:::note
      G_AUD["Guard: Immutable logs; correlation; tamper evidence"]:::note

      UC_OAUTH --- G_AUTH
      UC_BIND --- G_RBAC
      UC_ABAC --- G_ABAC
      UC_AUDIT --- G_AUD

    end

    %% ================= Actor Associations (Left → System) =================
    A_ADMIN --- UC_PROV
    A_ADMIN --- UC_ROLE
    A_ADMIN --- UC_GRP

    A_OWNER --- UC_BIND
    A_OWNER --- UC_REQ

    A_USER --- UC_CHECK

    %% ================= Actor Associations (Right → System) =================
    R_AUD --- UC_AUDIT
    R_SEC --- UC_ALERTS
    R_SYS --- UC_WS

    %% ================= Styles =================
    classDef actor fill:#eef2ff,stroke:#1e3a8a,stroke-width:1.5px
    classDef uc fill:#fff7ed,stroke:#9a3412,stroke-width:1.5px
    classDef note fill:#ecfeff,stroke:#0891b2,stroke-width:1px
```
