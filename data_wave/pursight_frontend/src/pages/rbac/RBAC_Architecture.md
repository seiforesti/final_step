# RBAC System Architecture (Enterprise-Grade, Azure-Inspired)

## 1. Overview

The RBAC (Role-Based Access Control) system provides fine-grained, enterprise-grade access management for the data platform, inspired by Azure RBAC. It supports classic RBAC, resource-level scoping, ABAC (attribute-based access control), delegation, access review, and detailed audit logging.

---

## 2. High-Level Architecture Diagram

```
+-------------------+         +-------------------+         +-------------------+
|    Frontend UI    | <-----> |     FastAPI       | <-----> |    Database       |
| (Ant Design,      |  REST   |  RBAC API Layer   |  ORM    | (SQLModel, Alembic|
|  React, Dark      | <-----> |  (routers,        | <-----> |  migrations)      |
|  Theme, Azure UX) |         |   services)       |         |                   |
+-------------------+         +-------------------+         +-------------------+
```

---

## 3. Core Components

### Backend (FastAPI)

- **Routers**: All RBAC endpoints are grouped under `/rbac` (see `rbac_routes.py`).
- **Models**: SQLModel classes for User, Role, Permission, ResourceRole, AccessRequest, RbacAuditLog, etc. (see `auth_models.py`).
- **Services**: Business logic for role assignment, permission checks, ABAC, delegation, audit logging, etc.
- **Database**: Alembic migrations for all RBAC tables.

### Frontend (React, Ant Design)

- **API Hooks**: All `/rbac/*` endpoints exposed as React Query hooks (`src/api/rbac.ts`).
- **RBAC Context**: Permission logic and context (`src/hooks/useRBAC.ts`).
- **RBAC Pages**: UI for roles, permissions, assignments, delegation, audit logs, etc. (`src/pages/rbac/`).
- **Azure UI Parity**: UI/UX closely matches Azure RBAC (see screenshots).

---

## 4. Key Features & Flow

### 4.1. User/Role/Permission Management

- Users, roles, and permissions are managed via dedicated endpoints and UI pages.
- Roles can be assigned globally or scoped to specific resources (resource-level RBAC).

### 4.2. Resource-Level Scoping

- Assign roles to users for specific resources (e.g., database, schema, table).
- Enables least-privilege, granular access.

### 4.3. ABAC (Attribute-Based Access Control)

- Permissions can include conditions (e.g., row-level security, time, attributes).
- `/rbac/test-abac` endpoint allows testing of complex access rules.

### 4.4. Delegation & Access Review

- Users can request access to resources (delegation workflow).
- Admins can review, approve, or reject access requests.
- Periodic access review supported (triggered by admin).

### 4.5. Audit Logging

- All RBAC actions are logged in `rbac_audit_logs`.
- Audit logs are filterable by user, action, resource, etc.

---

## 5. Data Model Relationships

- **User** <-> **Role**: Many-to-many (via UserRole)
- **Role** <-> **Permission**: Many-to-many (via RolePermission)
- **ResourceRole**: Assigns a Role to a User for a specific resource
- **AccessRequest**: Tracks delegation/access review requests
- **RbacAuditLog**: Records all RBAC actions

---

## 6. API Endpoint Map

- `/rbac/users`, `/rbac/roles`, `/rbac/permissions`: CRUD for core entities
- `/rbac/role-assignments`, `/rbac/assign-role-scope`, `/rbac/resource-roles`: Resource-level assignments
- `/rbac/access-requests`, `/rbac/request-access`, `/rbac/access-review`: Delegation & review
- `/rbac/audit-logs`, `/rbac/audit-logs/filter`: Audit logging
- `/rbac/builtin-roles`: Built-in roles (Azure-style)
- `/rbac/test-abac`: ABAC/condition testing

---

## 7. Security & Extensibility

- All endpoints require authentication and enforce RBAC checks.
- ABAC extensibility for future attribute-based rules.
- Designed for enterprise, multi-tenant, and compliance use cases.

---

## 8. Real-World Usage Scenarios

- Data stewards manage access to sensitive tables.
- Admins review and approve access requests.
- Audit logs support compliance and forensics.
- Custom roles and conditions for advanced security needs.

---

## 9. References

- See `rbac_routes.py`, `auth_models.py`, and `src/api/rbac.ts` for implementation details.
- Azure RBAC documentation and UI for design inspiration.
