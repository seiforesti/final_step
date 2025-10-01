# Compliance Module - Central Class Diagram

```mermaid
---
config:
  theme: neutral
---
classDiagram
direction TB
    class ComplianceFramework {
	    +str framework_id
	    +str name
	    +str version
	    +str description
	    +List~str~ supported_regions
	    +List~str~ applicable_industries
	    +Dict requirements_catalog
	    +Dict assessment_criteria
	    +Dict reporting_templates
	    +bool is_active
	    +datetime effective_date
	    +datetime expiry_date
	    +str regulatory_authority
	    +List~str~ related_frameworks
	    +Dict compliance_thresholds
	    +datetime created_at
	    +datetime updated_at
	    +validate_framework_requirements() bool
	    +generate_assessment_template() Dict
	    +calculate_compliance_score() float
	    +sync_with_regulatory_updates() void
    }
    class ComplianceRequirement {
	    +int id
	    +int organization_id
	    +int data_source_id
	    +ComplianceFramework framework
	    +str requirement_id
	    +str title
	    +str description
	    +str category
	    +str subcategory
	    +ComplianceStatus status
	    +float compliance_percentage
	    +datetime last_assessed
	    +datetime next_assessment
	    +str assessor
	    +str assessment_notes
	    +List~str~ evidence_files
	    +List~str~ documentation_links
	    +str risk_level
	    +str impact_description
	    +str remediation_plan
	    +datetime remediation_deadline
	    +str remediation_owner
	    +Dict requirement_metadata
	    +datetime created_at
	    +datetime updated_at
	    +assess_compliance() ComplianceAssessment
	    +validate_evidence() bool
	    +generate_remediation_plan() List~str~
	    +track_progress() Dict
	    +escalate_non_compliance() void
    }
    class ComplianceAssessment {
	    +int id
	    +int data_source_id
	    +ComplianceFramework framework
	    +str assessment_type
	    +str title
	    +str description
	    +AssessmentStatus status
	    +datetime scheduled_date
	    +datetime started_date
	    +datetime completed_date
	    +str assessor
	    +str assessment_firm
	    +float overall_score
	    +int compliant_requirements
	    +int non_compliant_requirements
	    +int total_requirements
	    +List findings
	    +List~str~ recommendations
	    +str report_file
	    +str certificate_file
	    +Dict assessment_metadata
	    +datetime created_at
	    +datetime updated_at
	    +execute_assessment() bool
	    +generate_findings_report() str
	    +create_remediation_roadmap() List~Dict~
	    +schedule_follow_up() datetime
    }
    class ComplianceGap {
	    +int id
	    +int data_source_id
	    +int requirement_id
	    +str gap_title
	    +str gap_description
	    +str severity
	    +str status
	    +str remediation_plan
	    +List~str~ remediation_steps
	    +str assigned_to
	    +datetime due_date
	    +float progress_percentage
	    +str last_updated_by
	    +str business_impact
	    +str technical_impact
	    +Dict gap_metadata
	    +datetime created_at
	    +datetime updated_at
	    +prioritize_gap() int
	    +assign_remediation_team() void
	    +track_remediation_progress() Dict
	    +validate_closure() bool
    }
    class ComplianceValidation {
	    +int id
	    +int data_source_id
	    +int requirement_id
	    +str validation_type
	    +str validation_method
	    +str validation_status
	    +float validation_score
	    +int passed_checks
	    +int failed_checks
	    +int total_checks
	    +List validation_details
	    +List~str~ error_messages
	    +List~str~ recommendations
	    +Dict validation_metadata
	    +datetime created_at
	    +datetime updated_at
	    +str validated_by
	    +int validation_duration
	    +execute_validation() bool
	    +generate_validation_report() str
	    +create_corrective_actions() List~str~
	    +schedule_revalidation() datetime
    }
    class ComplianceEvidence {
	    +int id
	    +int data_source_id
	    +int requirement_id
	    +str title
	    +str description
	    +str evidence_type
	    +str file_path
	    +str file_name
	    +int file_size
	    +str file_hash
	    +datetime valid_from
	    +datetime valid_until
	    +bool is_current
	    +str collected_by
	    +str collection_method
	    +Dict evidence_metadata
	    +datetime created_at
	    +datetime updated_at
	    +validate_evidence_integrity() bool
	    +archive_expired_evidence() void
	    +generate_evidence_chain() List~str~
	    +verify_authenticity() bool
    }
    class DataSource {
	    +int id
	    +str name
	    +DataSourceType source_type
	    +str host
	    +int port
	    +DataSourceStatus status
	    +DataClassification data_classification
	    +Environment environment
	    +Criticality criticality
	    +List~str~ tags
	    +str owner
	    +int organization_id
	    +str racine_orchestrator_id
	    +float health_score
	    +float compliance_score
	    +datetime created_at
	    +datetime updated_at
	    +assess_compliance_posture() Dict
	    +generate_compliance_report() str
	    +implement_controls() bool
	    +monitor_compliance_drift() Dict
    }
    class ComplianceRule {
	    +int id
	    +str rule_name
	    +str rule_description
	    +ComplianceFramework framework
	    +str rule_category
	    +str rule_expression
	    +str severity
	    +bool is_active
	    +Dict rule_parameters
	    +List~str~ applicable_data_types
	    +List~str~ applicable_environments
	    +float threshold_value
	    +str threshold_operator
	    +str remediation_guidance
	    +int execution_frequency_hours
	    +datetime last_executed
	    +int execution_count
	    +float success_rate
	    +datetime created_at
	    +datetime updated_at
	    +evaluate_rule() ComplianceValidation
	    +update_rule_parameters() void
	    +generate_remediation_plan() str
	    +optimize_rule_performance() void
    }
    class ClassificationResult {
	    +int id
	    +str uuid
	    +str entity_type
	    +str entity_id
	    +SensitivityLevel sensitivity_level
	    +ClassificationMethod method
	    +float confidence_score
	    +int data_source_id
	    +bool compliance_checked
	    +str compliance_status
	    +str compliance_notes
	    +datetime effective_date
	    +datetime created_at
	    +datetime updated_at
	    +validate_compliance_impact() bool
	    +trigger_compliance_assessment() void
	    +update_compliance_metadata() void
    }
    class ComplianceClassificationMapping {
	    +int id
	    +int classification_result_id
	    +int compliance_requirement_id
	    +str mapping_type
	    +str sensitivity_threshold
	    +bool auto_trigger_assessment
	    +Dict mapping_rules
	    +float compliance_impact_score
	    +str impact_description
	    +datetime created_at
	    +datetime updated_at
	    +evaluate_compliance_impact() float
	    +trigger_automated_assessment() void
	    +generate_impact_report() str
    }
    class ScanResult {
	    +int id
	    +int scan_id
	    +str schema_name
	    +str table_name
	    +str column_name
	    +List compliance_issues
	    +str sensitivity_level
	    +Dict scan_metadata
	    +datetime created_at
	    +datetime updated_at
	    +validate_compliance() List~ComplianceGap~
	    +generate_compliance_findings() Dict
	    +remediate_compliance_issues() bool
    }
    class ComplianceScanIntegration {
	    +int id
	    +int scan_result_id
	    +int compliance_rule_id
	    +str compliance_status
	    +str violation_severity
	    +float risk_score
	    +Dict validation_results
	    +List~str~ remediation_actions
	    +bool exception_granted
	    +str exception_reason
	    +datetime assessed_at
	    +str assessed_by
	    +bool review_required
	    +assess_scan_compliance() str
	    +calculate_risk_score() float
	    +generate_remediation_actions() List~str~
	    +request_exception() bool
    }
    class CatalogItem {
	    +int id
	    +str name
	    +CatalogItemType type
	    +DataClassification classification
	    +str owner
	    +str steward
	    +float quality_score
	    +int data_source_id
	    +int organization_id
	    +datetime created_at
	    +datetime updated_at
	    +assess_catalog_compliance() Dict
	    +apply_compliance_metadata() void
	    +validate_data_governance() bool
    }
    class ComplianceCatalogEnrichment {
	    +int id
	    +int catalog_item_id
	    +int compliance_requirement_id
	    +str enrichment_type
	    +Dict compliance_metadata
	    +List~str~ applicable_regulations
	    +str data_retention_period
	    +str access_restrictions
	    +List~str~ required_controls
	    +bool privacy_impact_required
	    +str compliance_classification
	    +datetime created_at
	    +datetime updated_at
	    +enrich_compliance_metadata() void
	    +validate_governance_alignment() bool
	    +generate_privacy_impact_assessment() str
    }
    class IntelligentScanRule {
	    +int id
	    +str rule_id
	    +str name
	    +List~str~ compliance_requirements
	    +float compliance_score
	    +datetime last_compliance_check
	    +bool audit_trail_required
	    +str data_retention_policy
	    +datetime created_at
	    +datetime updated_at
	    +validate_compliance_alignment() bool
	    +generate_compliance_report() str
	    +update_compliance_metrics() void
    }
    class ComplianceRuleIntegration {
	    +int id
	    +int scan_rule_id
	    +int compliance_requirement_id
	    +str integration_type
	    +bool auto_validation_enabled
	    +Dict validation_parameters
	    +float compliance_threshold
	    +str notification_settings
	    +datetime created_at
	    +datetime updated_at
	    +validate_rule_compliance() bool
	    +trigger_compliance_validation() void
	    +generate_compliance_metrics() Dict
    }
    class User {
	    +int id
	    +str email
	    +str role
	    +str first_name
	    +str last_name
	    +str department
	    +int organization_id
	    +bool is_active
	    +datetime created_at
	    +datetime last_login
	    +has_compliance_access() bool
	    +get_compliance_permissions() List~str~
	    +audit_compliance_activities() void
    }
    class Role {
	    +int id
	    +str name
	    +str description
	    +datetime created_at
	    +datetime updated_at
	    +get_compliance_permissions() List~Permission~
	    +validate_compliance_access() bool
	    +inherit_compliance_rights() void
    }
    class ComplianceAccessControl {
	    +int id
	    +int user_id
	    +int compliance_requirement_id
	    +str access_type
	    +str permission_level
	    +List~str~ allowed_actions
	    +datetime granted_at
	    +datetime expires_at
	    +str granted_by
	    +str justification
	    +bool is_active
	    +datetime created_at
	    +validate_access_request() bool
	    +audit_compliance_access() void
	    +check_access_expiry() bool
    }
    class RacineOrchestrationMaster {
	    +str id
	    +str name
	    +str description
	    +OrchestrationStatus status
	    +OrchestrationPriority priority
	    +List~str~ connected_groups
	    +Dict group_configurations
	    +Dict cross_group_dependencies
	    +Dict performance_metrics
	    +SystemHealthStatus health_status
	    +List~str~ compliance_requirements
	    +Dict audit_settings
	    +int created_by
	    +datetime created_at
	    +orchestrate_compliance_workflows() bool
	    +monitor_compliance_health() Dict
	    +coordinate_cross_group_compliance() void
	    +generate_executive_compliance_dashboard() Dict
    }
    class ComplianceAuditTrail {
	    +int id
	    +str audit_id
	    +str event_type
	    +str event_category
	    +str description
	    +int user_id
	    +int resource_id
	    +str resource_type
	    +Dict before_state
	    +Dict after_state
	    +str ip_address
	    +str user_agent
	    +str session_id
	    +str compliance_framework
	    +str risk_level
	    +bool regulatory_impact
	    +datetime event_timestamp
	    +datetime created_at
	    +generate_audit_report() str
	    +detect_compliance_anomalies() List~str~
	    +export_regulatory_audit() str
    }
    class ComplianceReport {
	    +int id
	    +str report_id
	    +str report_type
	    +str title
	    +ComplianceFramework framework
	    +int organization_id
	    +str report_period
	    +Dict executive_summary
	    +List compliance_scores
	    +List findings
	    +List recommendations
	    +List action_items
	    +str report_status
	    +datetime generated_at
	    +str generated_by
	    +str approved_by
	    +datetime approved_at
	    +str file_path
	    +datetime created_at
	    +generate_executive_summary() Dict
	    +create_action_plan() List~Dict~
	    +schedule_follow_up_assessment() datetime
	    +distribute_report() bool
    }
    class ComplianceMetrics {
	    +int id
	    +str metric_name
	    +str metric_category
	    +ComplianceFramework framework
	    +int organization_id
	    +float metric_value
	    +str metric_unit
	    +float target_value
	    +float threshold_warning
	    +float threshold_critical
	    +str trend_direction
	    +datetime measurement_date
	    +str measurement_period
	    +Dict metric_metadata
	    +datetime created_at
	    +calculate_compliance_score() float
	    +analyze_trends() Dict
	    +generate_metric_alerts() List~str~
	    +benchmark_against_industry() Dict
    }
    class Organization {
	    +int id
	    +str name
	    +str description
	    +str organization_type
	    +str industry_sector
	    +List~str~ operating_regions
	    +bool is_active
	    +Dict settings
	    +Dict compliance_requirements
	    +datetime created_at
	    +define_compliance_framework() ComplianceFramework
	    +manage_compliance_requirements() List~ComplianceRequirement~
	    +generate_compliance_dashboard() Dict
	    +enforce_compliance_policies() void
    }
   

    %% Core Compliance Framework relationships (1:many)
    ComplianceFramework "1" --> "0..*" ComplianceRequirement : defines requirements
    ComplianceFramework "1" --> "0..*" ComplianceAssessment : governs assessments
    ComplianceFramework "1" --> "0..*" ComplianceRule : contains rules
    ComplianceFramework "1" --> "0..*" ComplianceMetrics : measures performance
    ComplianceFramework "1" --> "0..*" ComplianceReport : framework report
    
    %% Compliance Requirement relationships (1:many)
    ComplianceRequirement "1" --> "0..*" ComplianceAssessment : assessed by
    ComplianceRequirement "1" --> "0..*" ComplianceGap : identifies gaps
    ComplianceRequirement "1" --> "0..*" ComplianceValidation : validates against
    ComplianceRequirement "1" --> "0..*" ComplianceEvidence : supported by evidence
    ComplianceRequirement "1" --> "0..*" ComplianceClassificationMapping : compliance mapping
    ComplianceRequirement "1" --> "0..*" ComplianceCatalogEnrichment : enriched with requirement
    ComplianceRequirement "1" --> "0..*" ComplianceRuleIntegration : integrates with requirement
    ComplianceRequirement "1" --> "0..*" ComplianceAccessControl : controls access to
    
    %% Compliance Assessment relationships (1:many)
    ComplianceAssessment "1" --> "0..*" ComplianceGap : identifies gaps
    ComplianceAssessment "1" --> "0..*" ComplianceReport : generates reports
    
    %% Compliance Validation relationships (many:1, no loops)
    ComplianceValidation "0..*" --> "1" ComplianceRequirement : validates requirement
    ComplianceValidation "0..*" --> "1" DataSource : validates data source
    ComplianceValidation "1" --> "0..*" ComplianceAuditTrail : creates audit records
    
    %% Cross-module dependencies (directional, no loops)
    DataSource "0..*" --> "1" ComplianceRequirement : subject to requirements
    DataSource "0..*" --> "1" ComplianceRule : governed by rules
    DataSource "0..*" --> "1" ComplianceAssessment : assesses data source
    
    %% Classification integration (many:1)
    ClassificationResult "0..*" --> "1" ComplianceClassificationMapping : compliance mapping
    ComplianceClassificationMapping "0..*" --> "1" ComplianceRequirement : maps to requirement
    
    %% Scan integration (many:1)
    ScanResult "0..*" --> "1" ComplianceScanIntegration : compliance assessment
    ComplianceScanIntegration "0..*" --> "1" ComplianceRule : evaluated by rule
    
    %% Catalog integration (many:1)
    CatalogItem "0..*" --> "1" ComplianceCatalogEnrichment : compliance enrichment
    ComplianceCatalogEnrichment "0..*" --> "1" ComplianceRequirement : enriched with requirement
    
    %% Intelligent Scan Rule integration (many:1)
    IntelligentScanRule "0..*" --> "1" ComplianceRuleIntegration : compliance integration
    ComplianceRuleIntegration "0..*" --> "1" ComplianceRequirement : integrates with requirement
    
    %% User and Access Control relationships (many:1)
    User "0..*" --> "1" Organization : belongs to
    User "1" --> "0..*" ComplianceAccessControl : compliance access
    User "1" --> "0..*" ComplianceAuditTrail : performs actions
    Role "1" --> "0..*" ComplianceAccessControl : role-based access
    ComplianceAccessControl "0..*" --> "1" ComplianceRequirement : controls access to
    ComplianceAuditTrail "0..*" --> "1" User : performed by user
    
    %% Racine Orchestrator relationships (central coordinator)
    RacineOrchestrationMaster "1" --> "0..*" ComplianceRequirement : orchestrates compliance
    RacineOrchestrationMaster "1" --> "0..*" ComplianceAssessment : coordinates assessments
    RacineOrchestrationMaster "0..*" --> "1" User : created by user
    
    %% Organization relationships (1:many)
    Organization "1" --> "0..*" ComplianceRequirement : defines requirements
    Organization "1" --> "0..*" ComplianceReport : generates reports
    Organization "1" --> "0..*" User : has users
    Organization "1" --> "0..*" DataSource : owns data sources
    Organization "1" --> "0..*" ComplianceMetrics : organization metrics

```

## Compliance Module - Central Analysis

### Core Responsibilities
The **Compliance** module serves as the regulatory and governance enforcement hub, managing:

1. **Regulatory Compliance**: Multi-framework compliance management (GDPR, HIPAA, SOX, PCI-DSS, etc.)
2. **Risk Assessment**: Continuous compliance risk monitoring and mitigation
3. **Audit Management**: Comprehensive audit trails and regulatory reporting
4. **Gap Analysis**: Compliance gap identification and remediation tracking
5. **Policy Enforcement**: Automated policy validation and enforcement
6. **Cross-Group Coordination**: Compliance workflows across all governance modules

### Key Integration Points

#### 1. **Data Source Module** (High Cohesion)
- Assesses data source compliance posture
- Enforces data protection and retention policies
- Monitors compliance drift and configuration changes
- Generates data source-specific compliance reports

#### 2. **Classification Module** (High Cohesion)
- Maps sensitivity classifications to compliance requirements
- Triggers compliance assessments based on data sensitivity
- Validates classification accuracy for regulatory purposes
- Enforces data handling policies based on sensitivity levels

#### 3. **Scan Logic Module** (High Cohesion)
- Validates scan results for compliance violations
- Assesses risk scores for discovered data
- Generates remediation actions for non-compliant findings
- Integrates compliance checks into scan workflows

#### 4. **Catalog Module** (Medium Cohesion)
- Enriches catalog items with compliance metadata
- Validates data governance alignment
- Manages data retention and access restrictions
- Generates privacy impact assessments

#### 5. **Scan Rule Sets Module** (Medium Cohesion)
- Validates scan rules for compliance alignment
- Integrates compliance requirements into rule execution
- Generates compliance metrics for rule effectiveness
- Ensures audit trail requirements are met

#### 6. **RBAC System** (High Cohesion - Security Wrapper)
- Controls access to compliance functions and data
- Manages compliance-related permissions and roles
- Audits all compliance-related activities
- Enforces segregation of duties for compliance processes

#### 7. **Racine Orchestrator** (Central Management)
- Orchestrates complex compliance workflows
- Coordinates cross-group compliance operations
- Monitors system-wide compliance health
- Generates executive compliance dashboards

### Advanced Compliance Features

#### 1. **Multi-Framework Support**
- **GDPR**: Data protection, consent management, right to erasure
- **HIPAA**: Protected health information safeguards
- **PCI-DSS**: Payment card data security standards
- **SOX**: Financial reporting controls and audit requirements
- **CCPA**: California consumer privacy protections
- **ISO27001**: Information security management systems
- **NIST**: Cybersecurity framework compliance

#### 2. **Automated Assessment Engine**
- Continuous compliance monitoring
- Risk-based assessment scheduling
- Automated evidence collection
- Real-time compliance scoring

#### 3. **Gap Management System**
- Automated gap identification
- Risk-based prioritization
- Remediation workflow management
- Progress tracking and reporting

#### 4. **Evidence Management**
- Digital evidence collection and storage
- Chain of custody maintenance
- Evidence integrity verification
- Automated evidence archival

#### 5. **Audit Trail System**
- Immutable audit logging
- Regulatory audit support
- Anomaly detection and alerting
- Forensic investigation capabilities

### Compliance Workflow Orchestration

#### 1. **Assessment Workflows**
- Scheduled compliance assessments
- Risk-triggered evaluations
- Cross-functional assessment coordination
- External auditor integration

#### 2. **Remediation Workflows**
- Automated remediation plan generation
- Task assignment and tracking
- Escalation procedures
- Validation and closure processes

#### 3. **Reporting Workflows**
- Executive dashboard generation
- Regulatory report compilation
- Stakeholder notification
- Compliance metric calculation

#### 4. **Incident Response**
- Compliance violation detection
- Incident escalation procedures
- Regulatory notification workflows
- Corrective action tracking

### Performance and Scalability

- **Real-time Monitoring**: Continuous compliance status tracking
- **Batch Processing**: Efficient large-scale compliance assessments
- **Intelligent Scheduling**: Risk-based assessment optimization
- **Distributed Architecture**: Scalable across enterprise environments
- **Caching Strategy**: Performance-optimized compliance data access
- **API Integration**: Seamless third-party tool integration

### Risk Management Integration

- **Risk Scoring**: Automated compliance risk calculation
- **Risk Matrices**: Multi-dimensional risk assessment
- **Risk Mitigation**: Automated control recommendations
- **Risk Reporting**: Executive risk dashboards
- **Risk Trending**: Historical risk analysis and forecasting
- **Risk Appetite**: Organizational risk tolerance management

This architecture ensures that the Compliance module can effectively serve as the central regulatory and governance hub while maintaining seamless integration with all other data governance modules and providing comprehensive compliance management capabilities.