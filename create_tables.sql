-- Create basic tables to resolve foreign key constraints
-- This script creates the minimal tables needed for the application to start

-- Create scan_rule_sets table
CREATE TABLE IF NOT EXISTS scan_rule_sets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_source_id INTEGER,
    include_schemas JSONB,
    exclude_schemas JSONB,
    include_tables JSONB,
    exclude_tables JSONB,
    include_columns JSONB,
    exclude_columns JSONB,
    sample_data BOOLEAN DEFAULT FALSE,
    sample_size INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create datasource table
CREATE TABLE IF NOT EXISTS datasource (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_type VARCHAR(50),
    location VARCHAR(50),
    host VARCHAR(255),
    port INTEGER,
    username VARCHAR(255),
    password_secret VARCHAR(255),
    secret_manager_type VARCHAR(50) DEFAULT 'local',
    use_encryption BOOLEAN DEFAULT FALSE,
    database_name VARCHAR(255),
    cloud_provider VARCHAR(50),
    cloud_config JSONB,
    replica_config JSONB,
    ssl_config JSONB,
    pool_size INTEGER DEFAULT 5,
    max_overflow INTEGER DEFAULT 10,
    pool_timeout INTEGER DEFAULT 30,
    connection_properties JSONB,
    additional_properties JSONB,
    status VARCHAR(50) DEFAULT 'PENDING',
    environment VARCHAR(50),
    criticality VARCHAR(50) DEFAULT 'MEDIUM',
    data_classification VARCHAR(50) DEFAULT 'INTERNAL',
    tags JSONB,
    owner VARCHAR(255),
    team VARCHAR(255),
    backup_enabled BOOLEAN DEFAULT FALSE,
    monitoring_enabled BOOLEAN DEFAULT FALSE,
    encryption_enabled BOOLEAN DEFAULT FALSE,
    scan_frequency VARCHAR(50) DEFAULT 'WEEKLY',
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    entity_count INTEGER DEFAULT 0,
    size_gb DECIMAL(10,2) DEFAULT 0.0,
    avg_response_time INTEGER,
    error_rate DECIMAL(5,4) DEFAULT 0.0,
    uptime_percentage DECIMAL(5,2) DEFAULT 100.0,
    connection_pool_size INTEGER DEFAULT 10,
    active_connections INTEGER DEFAULT 0,
    queries_per_second INTEGER DEFAULT 0,
    storage_used_percentage DECIMAL(5,2) DEFAULT 0.0,
    cost_per_month DECIMAL(10,2) DEFAULT 0.0
);

-- Create scan table
CREATE TABLE IF NOT EXISTS scan (
    id SERIAL PRIMARY KEY,
    scan_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    data_source_id INTEGER NOT NULL,
    scan_rule_set_id INTEGER,
    status VARCHAR(50) DEFAULT 'PENDING',
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    FOREIGN KEY (data_source_id) REFERENCES datasource(id),
    FOREIGN KEY (scan_rule_set_id) REFERENCES scan_rule_sets(id)
);

-- Create indexes for scan tables
CREATE INDEX IF NOT EXISTS idx_scan_rule_sets_name ON scan_rule_sets(name);
CREATE INDEX IF NOT EXISTS idx_datasource_name ON datasource(name);
CREATE INDEX IF NOT EXISTS idx_scan_scan_id ON scan(scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_data_source_id ON scan(data_source_id);
CREATE INDEX IF NOT EXISTS idx_scan_rule_sets_data_source_id ON scan_rule_sets(data_source_id);

-- Create monitoring system tables
CREATE TABLE IF NOT EXISTS monitoring_metrics (
    id SERIAL PRIMARY KEY,
    model_id VARCHAR NOT NULL,
    job_id VARCHAR,
    metric_type VARCHAR NOT NULL,
    value FLOAT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR DEFAULT 'healthy',
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_metric_model_type_time ON monitoring_metrics(model_id, metric_type, timestamp);

CREATE TABLE IF NOT EXISTS monitoring_alerts (
    id SERIAL PRIMARY KEY,
    model_id VARCHAR NOT NULL,
    alert_type VARCHAR NOT NULL,
    severity VARCHAR DEFAULT 'medium',
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR,
    resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_alert_model_severity ON monitoring_alerts(model_id, severity);
CREATE INDEX IF NOT EXISTS idx_alert_status ON monitoring_alerts(resolved_at);

CREATE TABLE IF NOT EXISTS monitoring_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,
    description TEXT,
    metric_type VARCHAR NOT NULL,
    condition TEXT NOT NULL,
    threshold FLOAT NOT NULL,
    severity VARCHAR DEFAULT 'medium',
    enabled BOOLEAN DEFAULT TRUE,
    cooldown_minutes INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    last_triggered TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS resource_metrics (
    id SERIAL PRIMARY KEY,
    resource_type VARCHAR NOT NULL,
    value FLOAT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR DEFAULT 'healthy',
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_resource_type_time ON resource_metrics(resource_type, timestamp);

CREATE TABLE IF NOT EXISTS resource_allocations (
    id SERIAL PRIMARY KEY,
    model_id VARCHAR NOT NULL,
    cpu_cores FLOAT NOT NULL,
    memory_gb FLOAT NOT NULL,
    gpu_count INTEGER DEFAULT 0,
    storage_gb FLOAT NOT NULL,
    network_bandwidth FLOAT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_allocation_model_time ON resource_allocations(model_id, timestamp);

-- ML model configurations and monitoring
CREATE TABLE IF NOT EXISTS ml_model_configurations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ml_model_monitoring (
    id SERIAL PRIMARY KEY,
    model_config_id INTEGER NOT NULL REFERENCES ml_model_configurations(id) ON DELETE CASCADE,
    monitoring_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Performance Metrics
    accuracy_metrics JSONB NOT NULL,
    precision_recall_metrics JSONB NOT NULL,
    prediction_distribution JSONB NOT NULL,
    
    -- Data Drift Detection
    input_drift_metrics JSONB DEFAULT '{}',
    prediction_drift_metrics JSONB DEFAULT '{}',
    concept_drift_indicators JSONB DEFAULT '{}',
    
    -- Model Behavior Analysis
    confidence_distribution JSONB NOT NULL,
    error_analysis JSONB DEFAULT '{}',
    bias_detection JSONB DEFAULT '{}',
    
    -- Resource and Performance
    inference_latency_metrics JSONB NOT NULL,
    throughput_metrics JSONB NOT NULL,
    resource_utilization JSONB DEFAULT '{}',
    
    -- Alerts and Recommendations
    alert_status VARCHAR(100) DEFAULT 'normal',
    alerts_triggered JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    
    -- Business Impact
    business_metrics JSONB DEFAULT '{}',
    roi_analysis JSONB DEFAULT '{}',
    
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for ML model monitoring
CREATE INDEX IF NOT EXISTS idx_ml_monitoring_model_timestamp ON ml_model_monitoring(model_config_id, monitoring_timestamp);
CREATE INDEX IF NOT EXISTS idx_ml_monitoring_alert ON ml_model_monitoring(alert_status);

-- Insert a default scan rule set to avoid foreign key issues
INSERT INTO scan_rule_sets (id, name, description) 
VALUES (1, 'Default', 'Default scan rule set for all data sources')
ON CONFLICT (id) DO NOTHING;

-- Insert a default data source to avoid foreign key issues
INSERT INTO datasource (id, name, source_type, location, host, port, username, password_secret) 
VALUES (1, 'Default', 'POSTGRESQL', 'LOCAL', 'localhost', 5432, 'postgres', 'default')
ON CONFLICT (id) DO NOTHING;

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
