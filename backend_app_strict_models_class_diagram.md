# Backend App - Strict Code-Only Models Class Diagram (High Cohesion, Low Coupling)

This diagram shows only code-defined classes from the backend under `app/models/**`, grouped into the seven base modules. It enforces no cycles, high cohesion within modules, and low coupling across modules, using `Organization` as the central wiring model. Associations use Mermaid-supported links only.

```mermaid
classDiagram

%% =====================
%% CENTRAL WIRING MODELS
%% =====================
class Organization {
  +id: int
  +organization_uuid: UUID
  +name: str
  +status: str
  +created_at: datetime
}
class OrganizationSetting {
  +id: int
  +organization_id: int
  +setting_key: str
  +setting_value: str
  +created_at: datetime
}
Organization o-- OrganizationSetting : has

%% =====================
%% MODULE 1: RBAC System
%% =====================
%% code: app/models/auth_models.py
namespace RBAC_System {
  class User {
    +id: int
    +email: str
    +hashed_password: str
    +is_active: bool
    +is_verified: bool
    +role: str
    +organization_id: int
    +created_at: datetime
  }
  class Role {
    +id: int
    +name: str
    +description: str
  }
  class Permission {
    +id: int
    +name: str
    +resource: str
    +action: str
  }
  class UserRole {
    +id: int
    +user_id: int
    +role_id: int
  }
  class UserGroup {
    +id: int
    +user_id: int
    +group_id: int
  }
  class Session {
    +id: int
    +user_id: int
    +token: str
    +expires_at: datetime
  }
  class EmailVerificationCode {
    +id: int
    +user_id: int
    +code: str
    +expires_at: datetime
  }
}

Organization o-- User : users

%% =====================
%% MODULE 2: Data Sources
%% =====================
%% code: app/models/scan_models.py (DataSource)
namespace Data_Sources {
  class DataSource {
    +id: int
    +name: str
    +type: DataSourceType
    +status: DataSourceStatus
    +organization_id: int
    +created_at: datetime
  }
  class DataSourceType <<enumeration>>
  class DataSourceStatus <<enumeration>>
}

Organization o-- DataSource : data_sources

%% =====================
%% MODULE 3: Scan Logic
%% =====================
%% code: app/models/scan_models.py (Scan, ScanResult, ScanOrchestrationJob, ScanWorkflowExecution)
namespace Scan_Logic {
  class Scan {
    +id: int
    +name: str
    +data_source_id: int
    +status: str
    +created_by: int
  }
  class ScanResult {
    +id: int
    +scan_id: int
    +table_name: str
    +column_name: str
    +classification: str
    +confidence_score: float
  }
  class ScanOrchestrationJob {
    +id: int
    +name: str
    +workflow_id: int
    +status: str
  }
  class ScanWorkflowExecution {
    +id: int
    +job_id: int
    +step_id: int
    +status: str
  }

  DataSource o-- Scan : source
  Scan o-- ScanResult : produces
  ScanOrchestrationJob o-- ScanWorkflowExecution : executes
}

Organization o-- ScanOrchestrationJob : scan_jobs

%% =====================
%% MODULE 4: Scan-Rule-Sets
%% =====================
%% code: app/models/advanced_scan_rule_models.py
namespace Scan_Rule_Sets {
  class IntelligentScanRule {
    +id: int
    +name: str
    +pattern: str
    +is_active: bool
  }
  class RuleExecutionHistory {
    +id: int
    +rule_id: int
    +status: str
    +executed_at: datetime
  }

  IntelligentScanRule o-- RuleExecutionHistory : history
}

Organization o-- IntelligentScanRule : rules

%% =====================
%% MODULE 5: Classifications
%% =====================
%% code: app/models/classification_models.py
namespace Classifications {
  class ClassificationRule {
    +id: int
    +name: str
    +type: str
    +sensitivity_level: str
    +confidence_threshold: float
    +organization_id: int
  }
  class DataClassification {
    +id: int
    +data_source_id: int
    +table_name: str
    +column_name: str
    +classification: str
    +confidence_score: float
    +rule_id: int
  }

  ClassificationRule o-- DataClassification : produces
}

Organization o-- ClassificationRule : classification_rules
DataSource o-- DataClassification : classified_asset

%% =====================
%% MODULE 6: Data Catalog
%% =====================
%% code: app/models/catalog_models.py
namespace Data_Catalog {
  class CatalogItem {
    +id: int
    +name: str
    +type: str
    +schema_name: str
    +table_name: str
    +column_name: str
    +classification: str
    +owner: str
    +organization_id: int
  }
  class CatalogTag {
    +id: int
    +name: str
    +description: str
    +organization_id: int
  }
  class CatalogItemTag {
    +id: int
    +catalog_item_id: int
    +tag_id: int
  }

  CatalogItem o-- CatalogItemTag : tagged
  CatalogTag o-- CatalogItemTag : applied
}

Organization o-- CatalogItem : catalog
Organization o-- CatalogTag : tags
DataSource o-- CatalogItem : assets

%% =====================
%% MODULE 7: Compliance Rules
%% =====================
%% code: app/models/compliance_models.py and compliance_rule_models.py
namespace Compliance_Rules {
  class ComplianceRule {
    +id: int
    +name: str
    +framework: str
    +description: str
    +organization_id: int
  }
  class ComplianceRequirement {
    +id: int
    +organization_id: int
    +data_source_id: int
    +framework: str
    +requirement_id: str
    +status: str
  }
  class ComplianceValidation {
    +id: int
    +requirement_id: int
    +scan_id: int
    +status: str
    +validated_at: datetime
  }

  ComplianceRequirement o-- ComplianceValidation : validatedBy
}

Organization o-- ComplianceRule : rules
Organization o-- ComplianceRequirement : requirements
DataSource o-- ComplianceRequirement : subject
Scan o-- ComplianceValidation : evidence

%% =====================
%% COUPLING LIMITS & DIRECTION
%% =====================
%% Cross-module references only via Organization, DataSource, Scan; no cycles added.
```
