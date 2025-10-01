# DataWave Data Layer Architecture - Eraser.io Diagram Specifications

## Overview

This document provides detailed specifications for creating Eraser.io diagrams for Section 2: Data Layer Architecture of the DataWave Enterprise Data Governance Platform.

## Diagram 1: Data Model Domain Overview

### Purpose

Visualize the complete data model architecture showing all domain models and their relationships.

### Eraser.io Specification

```eraser
title: DataWave Data Model Domain Overview

// Advanced Catalog Domain
Advanced Catalog Domain [icon: database, color: green] {
  IntelligentDataAsset [icon: table, color: lightgreen] {
    - id: int (PK)
    - asset_uuid: str (UK)
    - qualified_name: str (UK)
    - asset_type: AssetType
    - quality_score: float
    - semantic_tags: json[]
    - data_source_id: int (FK)
  }

  LineageRelationship [icon: arrow-right, color: lightgreen] {
    - id: int (PK)
    - upstream_asset_id: int (FK)
    - downstream_asset_id: int (FK)
    - lineage_type: LineageType
    - confidence_score: float
  }

  AssetTag [icon: tag, color: lightgreen] {
    - id: int (PK)
    - asset_id: int (FK)
    - tag_name: str
    - ai_generated: boolean
  }
}

// Scan Logic Domain
Scan Logic Domain [icon: search, color: blue] {
  DataSource [icon: server, color: lightblue] {
    - id: int (PK)
    - name: str (UK)
    - source_type: DataSourceType
    - host: str
    - encrypted_password: str
    - status: DataSourceStatus
  }

  EnhancedScanRuleSet [icon: rules, color: lightblue] {
    - id: int (PK)
    - rule_set_name: str (UK)
    - pattern_definition: json
    - ai_enhanced_patterns: json
    - data_source_id: int (FK)
  }

  ScanExecution [icon: play, color: lightblue] {
    - id: int (PK)
    - scan_uuid: str (UK)
    - data_source_id: int (FK)
    - status: ScanStatus
    - performance_metrics: json
  }
}

// AI/ML Intelligence Domain
AI/ML Intelligence Domain [icon: brain, color: orange] {
  AIModelConfiguration [icon: cpu, color: lightorange] {
    - id: int (PK)
    - model_name: str (UK)
    - model_type: AIModelType
    - configuration: json
    - performance_metrics: json
  }

  MLPrediction [icon: target, color: lightorange] {
    - id: int (PK)
    - prediction_uuid: str (UK)
    - model_id: int (FK)
    - asset_id: int (FK)
    - confidence_score: float
  }
}

// Compliance Domain
Compliance Domain [icon: shield, color: purple] {
  ComplianceRequirement [icon: checklist, color: lightpurple] {
    - id: int (PK)
    - data_source_id: int (FK)
    - framework: ComplianceFramework
    - status: ComplianceStatus
    - risk_level: str
  }

  ComplianceAssessment [icon: clipboard, color: lightpurple] {
    - id: int (PK)
    - data_source_id: int (FK)
    - framework: ComplianceFramework
    - overall_score: float
  }
}

// Authentication Domain
Authentication Domain [icon: lock, color: red] {
  User [icon: user, color: lightred] {
    - id: int (PK)
    - email: str (UK)
    - mfa_enabled: boolean
    - organization_id: int (FK)
  }

  Role [icon: key, color: lightred] {
    - id: int (PK)
    - name: str (UK)
    - permissions: json[]
  }
}

// Racine Orchestration Domain
Racine Orchestration Domain [icon: workflow, color: teal] {
  RacineOrchestrationMaster [icon: command, color: lightteal] {
    - id: str (PK)
    - orchestration_name: str
    - workflow_definition: json
    - organization_id: int (FK)
  }

  RacineWorkspace [icon: folder, color: lightteal] {
    - id: int (PK)
    - workspace_name: str (UK)
    - owner_id: int (FK)
  }
}

// Relationships
IntelligentDataAsset --> DataSource: belongs to
IntelligentDataAsset --> LineageRelationship: upstream/downstream
IntelligentDataAsset --> AssetTag: tagged with
IntelligentDataAsset --> MLPrediction: predicted for
DataSource --> EnhancedScanRuleSet: has rules
DataSource --> ScanExecution: scanned by
DataSource --> ComplianceRequirement: complies with
AIModelConfiguration --> MLPrediction: generates
User --> RacineOrchestrationMaster: creates/modifies
User --> RacineWorkspace: owns
```

## Diagram 2: Database Schema Relationships

### Purpose

Show detailed database schema with constraints, indexes, and referential integrity.

### Eraser.io Specification

```eraser
title: DataWave Database Schema Relationships

// Core organizational structure
organizations [icon: building, color: gray] {
  - id: int (PK)
  - name: str (UK)
  - created_at: timestamp
}

users [icon: user, color: blue] {
  - id: int (PK)
  - email: str (UK)
  - hashed_password: str
  - is_active: boolean
  - organization_id: int (FK)
  - mfa_enabled: boolean
}

// Data source management
datasource [icon: server, color: green] {
  - id: int (PK)
  - name: str (UK)
  - source_type: enum
  - host: str
  - port: int (1-65535)
  - encrypted_password: str
  - organization_id: int (FK)
  - created_by: int (FK)
}

// Intelligent data assets
intelligent_data_assets [icon: table, color: lightgreen] {
  - id: int (PK)
  - asset_uuid: str (UK)
  - qualified_name: str (UK)
  - asset_type: enum
  - quality_score: float (0.0-1.0)
  - semantic_tags: json[] (GIN indexed)
  - data_source_id: int (FK)
  - organization_id: int (FK)
}

// Lineage tracking
lineage_relationships [icon: arrow-right, color: orange] {
  - id: int (PK)
  - upstream_asset_id: int (FK)
  - downstream_asset_id: int (FK)
  - lineage_type: enum
  - confidence_score: float
}

// Scan executions
scan_executions [icon: play, color: blue] {
  - id: int (PK)
  - scan_uuid: str (UK)
  - data_source_id: int (FK)
  - status: enum
  - performance_metrics: jsonb
  - started_at: timestamp
}

// Compliance tracking
compliance_requirements [icon: shield, color: purple] {
  - id: int (PK)
  - data_source_id: int (FK)
  - framework: enum
  - status: enum
  - compliance_percentage: float
}

// Audit logging (partitioned)
audit_logs [icon: clipboard, color: red] {
  - id: int (PK)
  - event_timestamp: timestamp
  - event_type: str
  - table_name: str
  - user_id: int (FK)
  - old_values: jsonb (GIN indexed)
  - new_values: jsonb (GIN indexed)
}

// Relationships with cardinality
organizations --> users: 1:N employs
organizations --> datasource: 1:N owns
organizations --> intelligent_data_assets: 1:N manages

users --> datasource: 1:N creates
users --> audit_logs: 1:N performs actions

datasource --> intelligent_data_assets: 1:N contains
datasource --> scan_executions: 1:N scanned by
datasource --> compliance_requirements: 1:N subject to

intelligent_data_assets --> lineage_relationships: 1:N upstream
intelligent_data_assets --> lineage_relationships: 1:N downstream

// Constraints and notes
note "Partitioning Strategy" as partition_note {
  - audit_logs: Monthly partitions (7 year retention)
  - scan_executions: Daily partitions
  - intelligent_data_assets: Range by created_at
}

note "Index Strategy" as index_note {
  - B-Tree: Primary keys, foreign keys, timestamps
  - GIN: JSON/JSONB columns, full-text search
  - Partial: Active records, non-null values
  - Composite: (asset_type, quality_score, discovered_at)
}
```

## Diagram 3: JSON Schema Design Patterns

### Purpose

Illustrate JSON/JSONB usage patterns and query optimization strategies.

### Eraser.io Specification

```eraser
title: DataWave JSON Schema Design Patterns

// JSON column usage examples
JSON Usage Patterns [icon: code, color: yellow] {

  IntelligentDataAsset [icon: table, color: green] {
    schema_definition: jsonb {
      type: "table"
      columns: [
        {name: "id", type: "integer", nullable: false}
        {name: "email", type: "varchar", length: 255}
      ]
      indexes: [
        {name: "idx_email", columns: ["email"], type: "btree"}
      ]
    }

    semantic_tags: json[] {
      ["PII", "Customer Data", "GDPR"]
    }

    performance_metrics: jsonb {
      completeness: 0.987
      accuracy: 0.945
      consistency: 0.923
    }
  }

  ScanExecution [icon: play, color: blue] {
    execution_metadata: jsonb {
      scan_duration_ms: 45230
      records_processed: 1250000
      throughput_rps: 27650
      errors: {
        connection_timeouts: 2
        parsing_errors: 0
      }
    }
  }

  AIModelConfiguration [icon: brain, color: orange] {
    configuration: jsonb {
      model_type: "transformer"
      hyperparameters: {
        learning_rate: 2e-5
        batch_size: 32
        max_length: 512
      }
      performance: {
        accuracy: 0.942
        f1_score: 0.938
      }
    }
  }

  AuditLog [icon: clipboard, color: red] {
    old_values: jsonb {
      status: "pending"
      quality_score: 0.75
    }

    new_values: jsonb {
      status: "active"
      quality_score: 0.89
    }
  }
}

// Query patterns
Query Patterns [icon: search, color: purple] {

  Containment Queries {
    -- Find assets with PII tags
    SELECT * FROM intelligent_data_assets
    WHERE semantic_tags @> '["PII"]'
  }

  Path Extraction {
    -- Extract scan duration
    SELECT scan_uuid,
           performance_metrics->>'duration_ms'
    FROM scan_executions
  }

  Change Detection {
    -- Find status changes
    SELECT event_timestamp,
           old_values->>'status' as old_status,
           new_values->>'status' as new_status
    FROM audit_logs
    WHERE old_values->>'status' != new_values->>'status'
  }
}

// Index optimization
Index Strategy [icon: database, color: teal] {

  GIN Indexes {
    -- JSON array search
    CREATE INDEX idx_semantic_tags
    ON intelligent_data_assets
    USING GIN (semantic_tags)

    -- JSONB containment
    CREATE INDEX idx_schema_definition
    ON intelligent_data_assets
    USING GIN (schema_definition)
  }

  Expression Indexes {
    -- JSON array length
    CREATE INDEX idx_tags_count
    ON intelligent_data_assets
    (jsonb_array_length(semantic_tags))
  }
}
```

## Usage Instructions

### Creating Diagrams in Eraser.io

1. **Access Eraser.io**: Navigate to [eraser.io](https://eraser.io)
2. **Create New Diagram**: Click "New Diagram" and select "Entity Relationship"
3. **Import Specification**: Copy the Eraser.io specification code above
4. **Customize Styling**:
   - Adjust colors to match DataWave branding
   - Modify icon selections for better visual representation
   - Add annotations and notes for clarity

### Customization Options

#### Color Scheme

- **Catalog Domain**: Green (#4caf50)
- **Scan Domain**: Blue (#2196f3)
- **AI Domain**: Orange (#ff9800)
- **Compliance Domain**: Purple (#9c27b0)
- **Auth Domain**: Red (#e91e63)
- **Racine Domain**: Teal (#009688)

#### Icon Recommendations

- **Database**: `database`, `server`, `storage`
- **AI/ML**: `brain`, `cpu`, `target`
- **Security**: `lock`, `shield`, `key`
- **Workflow**: `workflow`, `command`, `play`
- **Data**: `table`, `chart`, `analytics`

### Integration with LaTeX Documentation

These Eraser.io diagrams complement the PlantUML diagrams and should be referenced in the LaTeX documentation as follows:

```latex
\begin{figure}[H]
    \centering
    \includegraphics[width=\textwidth]{diagrams/section_02_data_model_overview.png}
    \caption{DataWave Data Model Domain Overview (Eraser.io)}
    \label{fig:data_model_overview}
\end{figure}
```

### Export Settings

- **Format**: PNG (high resolution)
- **Size**: 1920x1080 minimum
- **Quality**: Maximum
- **Background**: Transparent or white

## Advanced Features

### Interactive Elements

- Clickable entities that show detailed schema information
- Hover tooltips with constraint and index details
- Expandable sections for complex JSON structures

### Animation Sequences

1. **Domain Introduction**: Fade in each domain package sequentially
2. **Relationship Mapping**: Animate relationship lines connecting entities
3. **Data Flow**: Show data movement through the system
4. **Performance Metrics**: Highlight performance-critical paths

### Collaboration Features

- Share diagrams with development team
- Version control integration
- Comment and annotation system
- Real-time collaborative editing
