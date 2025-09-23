# Classification Module - Central Class Diagram

```mermaid
classDiagram
    %% ===== CLASSIFICATION MODULE AS CENTRAL HUB =====
    
    class ClassificationFramework {
        +int id
        +str name
        +str description
        +str version
        +bool is_default
        +bool is_active
        +bool applies_to_data_sources
        +bool applies_to_schemas
        +bool applies_to_tables
        +bool applies_to_columns
        +List~str~ compliance_frameworks
        +List~str~ regulatory_requirements
        +str owner
        +str steward
        +bool approval_required
        +datetime created_at
        +datetime updated_at
        +str created_by
        +str updated_by
        
        +create_classification_policy() ClassificationPolicy
        +validate_compliance() bool
        +generate_framework_report() str
    }
    
    class ClassificationRule {
        +int id
        +int framework_id
        +str name
        +str description
        +ClassificationRuleType rule_type
        +str pattern
        +SensitivityLevel sensitivity_level
        +float confidence_threshold
        +bool is_active
        +int priority
        +ClassificationScope scope
        +Dict scope_filter
        +bool case_sensitive
        +bool whole_word_only
        +bool negate_match
        +Dict conditions
        +Dict context_requirements
        +bool applies_to_scan_results
        +bool applies_to_catalog_items
        +int compliance_requirement_id
        +str racine_orchestrator_id
        +int execution_count
        +int success_count
        +int false_positive_count
        +datetime last_executed
        +float avg_execution_time_ms
        +str version
        +int parent_rule_id
        +bool is_deprecated
        +datetime created_at
        +datetime updated_at
        
        +execute_classification() ClassificationResult
        +validate_pattern() bool
        +optimize_performance() void
        +learn_from_feedback() void
        +propagate_to_children() void
    }
    
    class ClassificationResult {
        +int id
        +str uuid
        +str entity_type
        +str entity_id
        +str entity_name
        +str entity_path
        +int rule_id
        +SensitivityLevel sensitivity_level
        +ClassificationMethod method
        +float confidence_score
        +ClassificationConfidenceLevel confidence_level
        +int data_source_id
        +int scan_id
        +int scan_result_id
        +int catalog_item_id
        +List~str~ matched_patterns
        +List~str~ matched_values
        +Dict context_data
        +Dict sample_data
        +int sample_size
        +int total_records
        +float match_percentage
        +bool is_validated
        +str validation_status
        +str validation_notes
        +datetime validation_date
        +str validated_by
        +int inherited_from_id
        +List~str~ propagated_to
        +int inheritance_depth
        +bool is_override
        +str override_reason
        +str override_approved_by
        +datetime override_approved_at
        +float processing_time_ms
        +float memory_usage_mb
        +ClassificationStatus status
        +datetime effective_date
        +datetime expiry_date
        +bool compliance_checked
        +str compliance_status
        +str compliance_notes
        +str version
        +int revision_number
        +datetime created_at
        +datetime updated_at
        +str created_by
        +str updated_by
        
        +apply_to_catalog() void
        +trigger_compliance_check() void
        +propagate_to_children() List~ClassificationResult~
        +validate_accuracy() bool
        +generate_evidence_report() str
    }
    
    class ClassificationPolicy {
        +int id
        +int framework_id
        +str name
        +str description
        +int priority
        +bool is_mandatory
        +bool auto_apply
        +bool requires_approval
        +ClassificationScope scope
        +Dict scope_filter
        +Dict conditions
        +SensitivityLevel default_sensitivity
        +Dict inheritance_rules
        +Dict notification_rules
        +datetime created_at
        +datetime updated_at
        +str created_by
        +str updated_by
        
        +apply_policy() bool
        +validate_conditions() bool
        +trigger_notifications() void
    }
    
    class ClassificationDictionary {
        +int id
        +str name
        +str description
        +str language
        +str encoding
        +bool is_case_sensitive
        +Dict entries
        +int entry_count
        +str category
        +str subcategory
        +List~str~ tags
        +str source_type
        +str source_reference
        +str imported_from
        +str validation_status
        +str validation_notes
        +float quality_score
        +int usage_count
        +datetime last_used
        +str version
        +int parent_dictionary_id
        +datetime created_at
        +datetime updated_at
        +str created_by
        +str updated_by
        
        +search_entries() List~str~
        +validate_quality() float
        +merge_dictionary() bool
        +export_entries() str
    }
    
    %% ===== DATA SOURCE MODULE CONNECTIONS =====
    
    class DataSource {
        +int id
        +str name
        +DataSourceType source_type
        +str host
        +int port
        +str username
        +DataSourceStatus status
        +DataClassification data_classification
        +List~str~ tags
        +str owner
        +int organization_id
        +str racine_orchestrator_id
        +float health_score
        +float compliance_score
        +datetime created_at
        +datetime updated_at
        
        +get_sample_data() Dict
        +validate_connection() bool
        +update_classification_metadata() void
    }
    
    class DataSourceClassificationSetting {
        +int id
        +int data_source_id
        +bool auto_classify
        +int classification_framework_id
        +SensitivityLevel default_sensitivity_level
        +bool classify_on_scan
        +str classification_frequency
        +bool inherit_schema_classification
        +bool inherit_table_classification
        +bool inherit_column_classification
        +int batch_size
        +int max_parallel_jobs
        +datetime created_at
        +datetime updated_at
        +str created_by
        +str updated_by
        
        +configure_auto_classification() void
        +optimize_batch_processing() void
        +validate_inheritance_rules() bool
    }
    
    %% ===== SCAN LOGIC MODULE CONNECTIONS =====
    
    class ScanResult {
        +int id
        +int scan_id
        +str schema_name
        +str table_name
        +str column_name
        +str object_type
        +List~str~ classification_labels
        +str sensitivity_level
        +List compliance_issues
        +str data_type
        +bool nullable
        +Dict scan_metadata
        +datetime created_at
        +datetime updated_at
        
        +apply_classification() ClassificationResult
        +update_sensitivity_labels() void
        +validate_classification_accuracy() bool
    }
    
    class ScanResultClassification {
        +int id
        +int scan_result_id
        +int classification_result_id
        +str classification_triggered_by
        +int scan_iteration
        +float data_quality_score
        +float completeness_score
        +float consistency_score
        +datetime created_at
        
        +link_scan_with_classification() void
        +calculate_quality_metrics() Dict
        +validate_classification_consistency() bool
    }
    
    %% ===== CATALOG MODULE CONNECTIONS =====
    
    class CatalogItem {
        +int id
        +str name
        +CatalogItemType type
        +str description
        +DataClassification classification
        +str owner
        +str steward
        +float quality_score
        +float popularity_score
        +int data_source_id
        +int organization_id
        +datetime created_at
        +datetime updated_at
        
        +apply_classification() void
        +update_sensitivity_metadata() void
        +enrich_business_context() void
    }
    
    class CatalogItemClassification {
        +int id
        +int catalog_item_id
        +int classification_result_id
        +bool is_primary_classification
        +str business_context
        +str usage_context
        +bool affects_lineage
        +bool affects_search
        +bool affects_recommendations
        +str enhanced_description
        +List~str~ business_glossary_terms
        +datetime created_at
        +datetime updated_at
        
        +enhance_catalog_metadata() void
        +update_search_index() void
        +generate_recommendations() List~str~
    }
    
    %% ===== COMPLIANCE MODULE CONNECTIONS =====
    
    class ComplianceRequirement {
        +int id
        +int organization_id
        +int data_source_id
        +ComplianceFramework framework
        +str requirement_id
        +str title
        +str description
        +str category
        +ComplianceStatus status
        +float compliance_percentage
        +datetime last_assessed
        +str assessor
        +str assessment_notes
        +str risk_level
        +str impact_description
        +str remediation_plan
        +datetime remediation_deadline
        +str remediation_owner
        +datetime created_at
        +datetime updated_at
        
        +validate_classification_compliance() bool
        +generate_compliance_report() str
        +track_remediation_progress() Dict
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
        +List error_messages
        +List recommendations
        +datetime created_at
        +datetime updated_at
        +str validated_by
        +int validation_duration
        
        +execute_classification_validation() bool
        +generate_remediation_actions() List~str~
        +notify_compliance_team() void
    }
    
    %% ===== SCAN RULE SETS MODULE CONNECTIONS =====
    
    class IntelligentScanRule {
        +int id
        +str rule_id
        +str name
        +str description
        +int enhanced_rule_set_id
        +str racine_orchestrator_id
        +RuleComplexityLevel complexity_level
        +PatternRecognitionType pattern_type
        +str rule_expression
        +List conditions
        +List actions
        +Dict ml_model_config
        +bool ai_context_awareness
        +bool learning_enabled
        +float confidence_threshold
        +float accuracy_score
        +int total_executions
        +datetime created_at
        +datetime updated_at
        
        +integrate_with_classification() void
        +share_pattern_insights() Dict
        +optimize_classification_rules() void
    }
    
    %% ===== RBAC SYSTEM MODULE CONNECTIONS =====
    
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
        
        +has_classification_permission() bool
        +get_classification_scope() List~str~
        +audit_classification_access() void
    }
    
    class Role {
        +int id
        +str name
        +str description
        +datetime created_at
        +datetime updated_at
        
        +get_classification_permissions() List~Permission~
        +validate_classification_access() bool
        +inherit_classification_rights() void
    }
    
    class Permission {
        +int id
        +str action
        +str resource
        +str conditions
        +datetime created_at
        
        +check_classification_access() bool
        +evaluate_conditions() bool
        +log_permission_check() void
    }
    
    %% ===== RACINE ORCHESTRATOR (MAIN MANAGER) =====
    
    class RacineOrchestrationMaster {
        +str id
        +str name
        +str description
        +str orchestration_type
        +OrchestrationStatus status
        +OrchestrationPriority priority
        +List~str~ connected_groups
        +Dict group_configurations
        +Dict cross_group_dependencies
        +Dict performance_metrics
        +SystemHealthStatus health_status
        +Dict resource_allocation
        +int total_executions
        +int successful_executions
        +int failed_executions
        +int created_by
        +datetime created_at
        
        +orchestrate_classification_workflows() bool
        +optimize_classification_performance() void
        +coordinate_cross_group_classification() void
        +monitor_classification_health() Dict
    }
    
    %% ===== AUDIT AND MONITORING =====
    
    class ClassificationAuditLog {
        +int id
        +str uuid
        +str event_type
        +str event_category
        +str event_description
        +str target_type
        +str target_id
        +str target_name
        +int classification_result_id
        +Dict old_values
        +Dict new_values
        +Dict event_data
        +str user_id
        +str user_role
        +str session_id
        +str ip_address
        +str user_agent
        +str system_version
        +str api_version
        +str request_id
        +str correlation_id
        +str risk_level
        +bool compliance_impact
        +bool requires_notification
        +float processing_time_ms
        +bool success
        +str error_message
        +datetime created_at
        
        +generate_audit_report() str
        +detect_anomalies() List~str~
        +trigger_compliance_alerts() void
    }
    
    class ClassificationMetrics {
        +int id
        +str metric_type
        +str metric_name
        +str metric_category
        +str scope_type
        +str scope_id
        +float metric_value
        +str metric_unit
        +float benchmark_value
        +str trend_direction
        +datetime measurement_period_start
        +datetime measurement_period_end
        +int sample_size
        +Dict details
        +datetime created_at
        
        +calculate_performance_metrics() Dict
        +generate_trend_analysis() Dict
        +compare_with_benchmarks() Dict
    }
    
    %% ===== ORGANIZATION (MULTI-TENANT) =====
    
    class Organization {
        +int id
        +str name
        +str description
        +str organization_type
        +bool is_active
        +Dict settings
        +Dict compliance_requirements
        +datetime created_at
        
        +manage_classification_frameworks() List~ClassificationFramework~
        +enforce_classification_policies() void
        +generate_classification_reports() List~str~
    }
    
    %% ===== RELATIONSHIPS =====
    
    %% Classification Framework as Central Hub
    ClassificationFramework --> ClassificationRule : "defines rules"
    ClassificationFramework --> ClassificationPolicy : "governs policies"
    ClassificationFramework --> Organization : "organization framework"
    
    %% Classification Rule Relationships
    ClassificationRule --> ClassificationResult : "produces results"
    ClassificationRule --> ClassificationFramework : "belongs to framework"
    ClassificationRule --> ComplianceRequirement : "enforces compliance"
    ClassificationRule --> RacineOrchestrationMaster : "orchestrated by racine"
    ClassificationRule --> ClassificationRule : "parent-child hierarchy"
    
    %% Classification Result Relationships
    ClassificationResult --> ClassificationRule : "generated by rule"
    ClassificationResult --> DataSource : "classifies data from"
    ClassificationResult --> ScanResult : "classifies scan results"
    ClassificationResult --> CatalogItem : "enriches catalog"
    ClassificationResult --> ClassificationResult : "inheritance hierarchy"
    ClassificationResult --> ClassificationAuditLog : "generates audit logs"
    
    %% Data Source Integration
    DataSource --> DataSourceClassificationSetting : "classification settings"
    DataSource --> ClassificationResult : "data classified"
    DataSourceClassificationSetting --> ClassificationFramework : "uses framework"
    
    %% Scan Logic Integration
    ScanResult --> ScanResultClassification : "classification links"
    ScanResultClassification --> ClassificationResult : "links to classification"
    
    %% Catalog Integration
    CatalogItem --> CatalogItemClassification : "classification enrichment"
    CatalogItemClassification --> ClassificationResult : "uses classification"
    
    %% Compliance Integration
    ComplianceRequirement --> ComplianceValidation : "validates compliance"
    ComplianceValidation --> ClassificationResult : "validates classifications"
    
    %% Scan Rule Sets Integration
    IntelligentScanRule --> ClassificationRule : "shares patterns"
    
    %% RBAC Integration
    User --> ClassificationResult : "creates classifications"
    User --> ClassificationAuditLog : "performs actions"
    Role --> Permission : "has permissions"
    Permission --> ClassificationRule : "controls access"
    
    %% Dictionary Relationships
    ClassificationDictionary --> ClassificationRule : "provides patterns"
    
    %% Racine Orchestrator Integration
    RacineOrchestrationMaster --> ClassificationRule : "manages rules"
    RacineOrchestrationMaster --> ClassificationFramework : "orchestrates frameworks"
    
    %% Audit and Monitoring
    ClassificationMetrics --> ClassificationFramework : "measures framework performance"
    ClassificationMetrics --> ClassificationRule : "measures rule performance"
    
    %% Organization Relationships
    Organization --> ClassificationFramework : "owns frameworks"
    Organization --> User : "has users"
    Organization --> DataSource : "owns data sources"

    %% Styling
    classDef centralClass fill:#fff3e0,stroke:#e65100,stroke-width:4px
    classDef dataSourceClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef scanLogicClass fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef catalogClass fill:#e0f2f1,stroke:#004d40,stroke-width:2px
    classDef complianceClass fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef ruleSetClass fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef rbacClass fill:#fff8e1,stroke:#f57f17,stroke-width:2px
    classDef racineClass fill:#ffebee,stroke:#c62828,stroke-width:3px
    classDef auditClass fill:#f9fbe7,stroke:#827717,stroke-width:2px
    classDef orgClass fill:#f1f8e9,stroke:#33691e,stroke-width:2px

    class ClassificationFramework centralClass
    class ClassificationRule centralClass
    class ClassificationResult centralClass
    class ClassificationPolicy centralClass
    class ClassificationDictionary centralClass
    class DataSource dataSourceClass
    class DataSourceClassificationSetting dataSourceClass
    class ScanResult scanLogicClass
    class ScanResultClassification scanLogicClass
    class CatalogItem catalogClass
    class CatalogItemClassification catalogClass
    class ComplianceRequirement complianceClass
    class ComplianceValidation complianceClass
    class IntelligentScanRule ruleSetClass
    class User rbacClass
    class Role rbacClass
    class Permission rbacClass
    class RacineOrchestrationMaster racineClass
    class ClassificationAuditLog auditClass
    class ClassificationMetrics auditClass
    class Organization orgClass
```

## Classification Module - Central Analysis

### Core Responsibilities
The **Classification** module serves as the intelligent data sensitivity and privacy hub, managing:

1. **Automated Classification**: AI/ML-powered pattern recognition and data classification
2. **Policy Enforcement**: Framework-based classification policies and governance
3. **Sensitivity Management**: Multi-level sensitivity labeling and inheritance
4. **Pattern Recognition**: Advanced regex, ML, and semantic analysis patterns
5. **Compliance Integration**: Regulatory compliance validation and reporting
6. **Cross-Group Orchestration**: Classification workflows across all modules

### Key Integration Points

#### 1. **Data Source Module** (High Cohesion)
- Receives data samples for classification analysis
- Applies classification settings per data source
- Configures auto-classification workflows
- Manages inheritance rules for schema/table/column levels

#### 2. **Scan Logic Module** (High Cohesion)
- Classifies scan results in real-time
- Links scan discoveries with classification outcomes
- Provides quality metrics for classification accuracy
- Triggers compliance validations based on classifications

#### 3. **Catalog Module** (High Cohesion)
- Enriches catalog items with classification metadata
- Updates business context and glossary terms
- Affects search indexing and recommendations
- Maintains classification lineage and relationships

#### 4. **Compliance Module** (High Cohesion)
- Validates regulatory compliance requirements
- Generates compliance reports and audit trails
- Tracks remediation progress for non-compliant data
- Enforces data retention and privacy policies

#### 5. **Scan Rule Sets Module** (Medium Cohesion)
- Shares pattern recognition insights
- Integrates ML models and semantic analysis
- Optimizes rule performance through feedback loops
- Coordinates intelligent rule execution

#### 6. **RBAC System** (High Cohesion - Security Wrapper)
- Controls access to classification functions
- Manages user permissions for sensitivity levels
- Audits all classification activities
- Enforces role-based classification policies

#### 7. **Racine Orchestrator** (Central Management)
- Orchestrates complex classification workflows
- Coordinates cross-group classification operations
- Optimizes classification performance and resources
- Monitors system-wide classification health

### Advanced Features

#### 1. **AI-Enhanced Classification**
- Machine learning pattern recognition
- Semantic analysis and NLP processing
- Adaptive learning from user feedback
- Context-aware classification decisions

#### 2. **Multi-Level Sensitivity Management**
- Hierarchical sensitivity levels (Public → Restricted → Top Secret)
- Regulatory categories (PII, PHI, PCI, GDPR, CCPA, HIPAA, SOX)
- Business categories (Financial, IP, Trade Secrets, Customer Data)
- Custom enterprise sensitivity levels

#### 3. **Pattern Library and Dictionaries**
- Reusable classification patterns
- Multi-language dictionary support
- Quality-scored pattern effectiveness
- Community-driven pattern sharing

#### 4. **Inheritance and Propagation**
- Parent-child classification inheritance
- Automatic propagation to related entities
- Override mechanisms with approval workflows
- Conflict resolution strategies

#### 5. **Comprehensive Audit Trail**
- Detailed classification activity logging
- Change tracking and version control
- Compliance audit support
- Anomaly detection and alerting

### Performance Characteristics

- **Real-time Processing**: Sub-second classification responses
- **Batch Processing**: Optimized for large-scale data classification
- **ML Model Integration**: Support for custom and pre-trained models
- **Caching Strategy**: Intelligent result caching for performance
- **Scalable Architecture**: Horizontal scaling for enterprise workloads
- **Quality Metrics**: Continuous accuracy monitoring and improvement

### Compliance and Governance

- **Multi-Framework Support**: GDPR, HIPAA, PCI-DSS, SOX, CCPA, ISO27001
- **Policy Automation**: Automated policy enforcement and validation
- **Risk Assessment**: Data risk scoring and mitigation recommendations
- **Audit Readiness**: Comprehensive audit trails and reporting
- **Data Retention**: Automated retention policy enforcement
- **Privacy Impact**: Privacy impact assessment integration

This architecture ensures that the Classification module can effectively serve as the central intelligence hub for data sensitivity and privacy management while maintaining seamless integration with all other governance modules.