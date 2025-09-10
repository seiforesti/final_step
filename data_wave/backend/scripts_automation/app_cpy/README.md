# Enterprise-Grade Data Governance Platform

This platform implements an enterprise-grade data governance solution similar to Microsoft Purview, specifically designed for comprehensive data management, governance, and compliance. It includes advanced scanning, classification, sensitivity labeling, and role-based access control (RBAC) capabilities.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
  - [Data Source Management](#1-data-source-connector-layer)
  - [Scan Framework](#2-scan-framework)
  - [Data Map Catalog](#3-data-map-catalog)
  - [Classification & Sensitivity Labeling](#4-classification-and-sensitivity-labeling)
  - [Role-Based Access Control (RBAC)](#5-role-based-access-control-rbac)
  - [Machine Learning Integration](#6-machine-learning-integration)
  - [Dashboard & Analytics](#7-dashboard-and-analytics)
  - [FastAPI Integration](#8-fastapi-integration)
  - [Scheduling](#9-scheduling)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Integration with Existing System](#integration-with-existing-system)
- [Future Extensions](#future-extensions)

## Overview

This platform provides comprehensive data governance capabilities inspired by Microsoft Purview but with enhanced features for databases that Purview doesn't fully support (MySQL, PostgreSQL, MongoDB). It offers advanced classification, sensitivity labeling, role-based access control, and machine learning integration.

The system allows you to:

1. Register and manage data sources (MySQL, PostgreSQL, MongoDB)
2. Create scan rule sets to define what to include/exclude during scans
3. Execute scans to extract metadata and build a comprehensive data catalog
4. Classify data and apply sensitivity labels using both rule-based and ML-powered approaches
5. Control access to data and features through a sophisticated RBAC system with attribute-based capabilities
6. View detailed analytics and insights through an interactive dashboard
7. Schedule recurring scans and automated processes
8. Manage data lineage and track data flows across systems
9. Generate compliance reports and monitor sensitive data

## Architecture

The platform follows a modular, microservices-inspired architecture with clear separation of concerns. Each component is designed to be independently scalable and maintainable.

### Core Components

1. **Data Models**
   - `DataSource`: Represents a registered database connection
   - `ScanRuleSet`: Defines what to include/exclude during scans
   - `Scan`: Represents a scan operation
   - `ScanResult`: Stores scan results
   - `ScanSchedule`: Manages recurring scans
   - `User`: Represents system users with roles and permissions
   - `Role`: Defines sets of permissions for RBAC
   - `Permission`: Granular access controls for system features
   - `SensitivityLabel`: Defines data sensitivity classifications
   - `MLModel`: Represents machine learning models for classification

2. **Services**
   - `DataSourceService`: Manages data sources
   - `ScanRuleSetService`: Manages scan rule sets
   - `ScanService`: Executes scans and processes results
   - `ScanSchedulerService`: Manages scan schedules
   - `ClassificationService`: Handles data classification
   - `SensitivityLabelingService`: Manages sensitivity labels
   - `RBACService`: Handles role-based access control
   - `DashboardService`: Provides analytics and insights
   - `LineageService`: Tracks data lineage
   - `ComplianceService`: Generates compliance reports
   - `MLService`: Manages machine learning models for classification

3. **API Layer**
   - FastAPI routes for all operations
   - RESTful endpoints with proper authentication and authorization
   - Swagger documentation with interactive testing

4. **Security Layer**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Attribute-based access control (ABAC) for fine-grained permissions
   - Audit logging for all sensitive operations

5. **Integration Layer**
   - Connects to extraction services for different data sources
   - Integrates with machine learning services for classification
   - Webhook support for external system notifications

### System Flow

1. User authentication and authorization through RBAC
2. Register and manage data sources with appropriate permissions
3. Create scan rule sets to define what to include/exclude
4. Execute scans, which:
   - Connect to data sources with secure credential management
   - Extract metadata based on scan rule sets
   - Apply classification and sensitivity labels (rule-based and ML-powered)
   - Store results in the database with proper access controls
5. View scan results, analytics, and insights through the dashboard
6. Manage data lineage and track data flows
7. Generate compliance reports for regulatory requirements
8. Schedule recurring scans and automated processes

## Features

### 1. Data Source Connector Layer

- Support for both on-prem and cloud deployments
- Flexible connectors using stable protocols
- Connection validation with detailed error reporting
- Secure credential management with encryption
- Support for MySQL, PostgreSQL, and MongoDB databases

### 2. Scan Framework

- Scan objects that connect to registered data sources
- Metadata extraction (schemas, tables, fields, types)
- Results storage in a data map/catalog
- Scan rule sets with include/exclude rules for schemas, tables, and fields
- Incremental scanning capabilities
- Scan history and version tracking

### 3. Data Map Catalog

- Hierarchical storage of metadata (Source → DBs → Tables/Collections → Columns/Fields)
- Advanced search and filtering capabilities
- Queryable metadata with SQL-like interface
- Data lineage tracking and visualization
- Relationship mapping between data entities

### 4. Classification and Sensitivity Labeling

- Rule-based classification engine for data elements
- Machine learning-powered classification suggestions
- Hierarchical sensitivity labels with inheritance
- Collaborative workflow for label reviews and approvals
- Label change history and audit trail
- Justification and documentation for compliance

### 5. Role-Based Access Control (RBAC)

- Granular permission system for all platform features
- Role-based access control with hierarchical roles
- Attribute-based access control (ABAC) for context-aware permissions
- User management with role assignments
- Permission inheritance and override capabilities
- Audit logging for all access control changes

### 6. Machine Learning Integration

- ML-powered classification and sensitivity labeling
- Model training and versioning
- Feedback collection for continuous improvement
- Confidence scoring for suggestions
- Explainable AI features for transparency
- Model performance analytics and monitoring

### 7. Dashboard and Analytics

- Comprehensive dashboard for system overview
- Scan statistics and trends visualization
- Data source analytics and insights
- Metadata statistics and growth tracking
- Compliance reporting and monitoring
- Data lineage visualization and analysis

### 8. FastAPI Integration

- RESTful endpoints for all operations
- Swagger documentation with interactive testing
- Error handling and validation
- Authentication and authorization middleware
- Rate limiting and request throttling
- Comprehensive logging and monitoring

### 9. Scheduling

- Cron-based scheduling for recurring tasks
- Enable/disable schedules with immediate effect
- Automatic execution of scheduled scans
- Notification system for scan completions and failures
- Priority-based scheduling for resource management
- Dependency management for sequential tasks

## Installation

### Prerequisites

- Docker and Docker Compose
- Python 3.9+

### Setup

1. Clone the repository
2. Navigate to the project directory
3. Build and start the containers:

```bash
docker-compose up -d
```

This will start all required services, including:

- MySQL, PostgreSQL, and MongoDB servers (for testing)
- Metadata database (PostgreSQL)
- Extraction service
- Scan service
- PGAdmin (for database management)

## Usage

### 1. Register a Data Source

```bash
curl -X POST "http://localhost:8001/scan/data-sources" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My MySQL Database",
    "source_type": "mysql",
    "location": "on-prem",
    "host": "mysql-server",
    "port": 3306,
    "username": "root",
    "password": "root",
    "database_name": "testdb",
    "description": "Test MySQL database"
  }'
```

### 2. Create a Scan Rule Set

```bash
curl -X POST "http://localhost:8001/scan/rule-sets" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Scan Rule Set",
    "data_source_id": 1,
    "description": "Test scan rule set",
    "include_schemas": ["testdb"],
    "exclude_tables": ["log_*"],
    "sample_data": false
  }'
```

### 3. Execute a Scan

```bash
curl -X POST "http://localhost:8001/scan/scans" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Scan",
    "data_source_id": 1,
    "scan_rule_set_id": 1,
    "description": "Test scan"
  }'
```

Then execute the scan:

```bash
curl -X POST "http://localhost:8001/scan/scans/1/execute"
```

### 4. View Scan Results

```bash
curl -X GET "http://localhost:8001/scan/scans/1/results"
```

### 5. Create a Scan Schedule

```bash
curl -X POST "http://localhost:8001/scan/schedules" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Scan",
    "data_source_id": 1,
    "scan_rule_set_id": 1,
    "cron_expression": "0 0 * * *",
    "description": "Daily scan at midnight",
    "enabled": true
  }'
```

## API Endpoints

### Data Sources

- `POST /scan/data-sources`: Create a new data source
- `GET /scan/data-sources`: Get all data sources
- `GET /scan/data-sources/{data_source_id}`: Get a data source by ID
- `PUT /scan/data-sources/{data_source_id}`: Update a data source
- `DELETE /scan/data-sources/{data_source_id}`: Delete a data source
- `POST /scan/data-sources/{data_source_id}/validate`: Validate connection to a data source

### Scan Rule Sets

- `POST /scan/rule-sets`: Create a new scan rule set
- `GET /scan/rule-sets`: Get all scan rule sets
- `GET /scan/rule-sets/{rule_set_id}`: Get a scan rule set by ID
- `PUT /scan/rule-sets/{rule_set_id}`: Update a scan rule set
- `DELETE /scan/rule-sets/{rule_set_id}`: Delete a scan rule set

### Scans

- `POST /scan/scans`: Create a new scan
- `GET /scan/scans`: Get all scans
- `GET /scan/scans/{scan_id}`: Get a scan by ID
- `POST /scan/scans/{scan_id}/execute`: Execute a scan
- `GET /scan/scans/{scan_id}/results`: Get scan results
- `GET /scan/scans/{scan_id}/summary`: Get a summary of scan results
- `DELETE /scan/scans/{scan_id}`: Delete a scan

### Scan Schedules

- `POST /scan/schedules`: Create a new scan schedule
- `GET /scan/schedules`: Get all scan schedules
- `GET /scan/schedules/{schedule_id}`: Get a scan schedule by ID
- `PUT /scan/schedules/{schedule_id}`: Update a scan schedule
- `POST /scan/schedules/{schedule_id}/enable`: Enable a scan schedule
- `POST /scan/schedules/{schedule_id}/disable`: Disable a scan schedule
- `DELETE /scan/schedules/{schedule_id}`: Delete a scan schedule

### Classification and Sensitivity Labeling

- `POST /api/classify/schema`: Classify a database schema
- `POST /api/classify/update-sensitivity-labels`: Update sensitivity labels
- `GET /api/sensitivity-labels`: Get all sensitivity labels
- `GET /api/sensitivity-labels/{label_id}`: Get a sensitivity label by ID
- `POST /api/sensitivity-labels`: Create a new sensitivity label
- `PUT /api/sensitivity-labels/{label_id}`: Update a sensitivity label
- `DELETE /api/sensitivity-labels/{label_id}`: Delete a sensitivity label
- `POST /api/sensitivity-labels/suggest`: Get label suggestions for data

### Machine Learning

- `GET /api/ml/models`: Get all ML models
- `GET /api/ml/models/{model_id}`: Get an ML model by ID
- `POST /api/ml/models/train`: Train a new ML model
- `PUT /api/ml/models/{model_id}/activate`: Activate an ML model
- `GET /api/ml/suggestions`: Get ML-powered suggestions
- `POST /api/ml/feedback`: Submit feedback for ML suggestions
- `GET /api/ml/analytics`: Get ML performance analytics

### Dashboard

- `GET /api/dashboard/summary`: Get dashboard summary statistics
- `GET /api/dashboard/trends`: Get scan trend data
- `GET /api/dashboard/data-sources`: Get data source statistics
- `GET /api/dashboard/metadata`: Get metadata statistics
- `GET /api/dashboard/lineage`: Get data lineage information
- `GET /api/dashboard/lineage/graph`: Get data lineage graph
- `GET /api/dashboard/lineage/entity/{entity_type}/{entity_id}`: Get lineage for a specific entity
- `POST /api/dashboard/lineage/export-to-purview`: Export lineage to Purview
- `GET /api/dashboard/compliance`: Get compliance overview
- `GET /api/dashboard/compliance/standards`: Get compliance standards
- `GET /api/dashboard/compliance/sensitivity-levels`: Get sensitivity levels
- `GET /api/dashboard/compliance/report/{standard_id}`: Get compliance report for a standard
- `GET /api/dashboard/compliance/sensitivity-report`: Get sensitivity report

### RBAC (Role-Based Access Control)

- `GET /api/rbac/me`: Get current user's permissions and roles
- `GET /api/rbac/users`: Get all users
- `GET /api/rbac/users/{user_id}`: Get a user by ID
- `POST /api/rbac/users`: Create a new user
- `PUT /api/rbac/users/{user_id}`: Update a user
- `DELETE /api/rbac/users/{user_id}`: Delete a user
- `GET /api/rbac/roles`: Get all roles
- `GET /api/rbac/roles/{role_id}`: Get a role by ID
- `POST /api/rbac/roles`: Create a new role
- `PUT /api/rbac/roles/{role_id}`: Update a role
- `DELETE /api/rbac/roles/{role_id}`: Delete a role
- `GET /api/rbac/permissions`: Get all permissions
- `POST /api/rbac/test-abac`: Test attribute-based access control

### AI Assistant

- `POST /api/ai/ask`: Ask the AI assistant a question

## Integration with Existing System

The platform integrates with various services and systems to provide a comprehensive data governance solution:

1. **Extraction Services**: The platform uses specialized extraction services for different data sources to extract metadata, schema information, and sample data. It makes secure API calls to these services with proper authentication.

2. **Classification and Sensitivity Labeling**: The platform includes advanced classification engines and sensitivity labeling systems that can be applied to data elements at various levels (column, table, schema). It supports both rule-based and ML-powered approaches.

3. **Role-Based Access Control (RBAC)**: All components of the platform are secured through a sophisticated RBAC system with attribute-based capabilities. This ensures that users can only access data and features they are authorized to use.

4. **Machine Learning Services**: The platform integrates with ML services for classification, sensitivity labeling, and anomaly detection. It includes model training, versioning, and feedback collection for continuous improvement.

5. **Dashboard and Analytics**: Comprehensive dashboards provide insights into data sources, scan results, compliance status, and system performance. Interactive visualizations help users understand their data landscape.

6. **Data Lineage**: The platform tracks data lineage across systems, showing how data flows between sources, transformations, and destinations. This helps with impact analysis and regulatory compliance.

7. **Compliance Reporting**: Automated compliance reports help organizations meet regulatory requirements by identifying sensitive data, access patterns, and potential risks.

## Future Extensions

### 1. Enhanced Security

- Integration with advanced secret management systems (e.g., HashiCorp Vault, Azure Key Vault)
- Multi-factor authentication for sensitive operations
- Enhanced encryption for data at rest and in transit
- Anomaly detection for unusual access patterns
- Comprehensive security audit and compliance reporting

### 2. Advanced Data Processing

- Real-time data quality assessment and monitoring
- Advanced data profiling with statistical analysis
- Anomaly detection in data patterns
- Custom processing rules using domain-specific languages
- Automated data remediation workflows

### 3. Advanced AI/ML Capabilities

- Natural language processing for data context understanding
- Automated data classification using deep learning
- Predictive analytics for data usage patterns
- Recommendation systems for data governance actions
- Explainable AI for transparent decision-making

### 4. Extended Data Source Support

- Support for additional database types (e.g., Oracle, SQL Server, Snowflake)
- Integration with cloud data warehouses (e.g., BigQuery, Redshift)
- Support for semi-structured data (e.g., JSON, XML)
- Support for unstructured data (e.g., documents, images)
- Integration with streaming data platforms (e.g., Kafka, Kinesis)

### 5. Advanced Integration Capabilities

- Bidirectional integration with Microsoft Purview
- Integration with enterprise data catalogs
- Webhook system for event-driven architectures
- API gateway for third-party integrations
- Integration with CI/CD pipelines for DataOps

### 6. Collaborative Features

- Enhanced workflow for data governance tasks
- Commenting and discussion threads on data elements
- Knowledge sharing and documentation features
- Team-based governance with delegation capabilities
- Gamification elements for encouraging participation

## License

This project is licensed under the MIT License - see the LICENSE file for details.