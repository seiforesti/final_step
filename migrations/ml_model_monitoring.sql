-- Create ML Model Monitoring table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ml_monitoring_model_timestamp ON ml_model_monitoring(model_config_id, monitoring_timestamp);
CREATE INDEX IF NOT EXISTS idx_ml_monitoring_alert ON ml_model_monitoring(alert_status);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ml_model_monitoring TO app_user;
GRANT USAGE, SELECT ON SEQUENCE ml_model_monitoring_id_seq TO app_user;
