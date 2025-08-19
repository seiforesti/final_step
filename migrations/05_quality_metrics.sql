-- Create quality dimensions table
CREATE TABLE IF NOT EXISTS quality_dimensions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    weight FLOAT DEFAULT 1.0,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quality_dimensions_name ON quality_dimensions(name);

-- Create quality metrics table
CREATE TABLE IF NOT EXISTS quality_metrics (
    id SERIAL PRIMARY KEY,
    data_source_id INTEGER NOT NULL REFERENCES datasource(id) ON DELETE CASCADE,
    table_name VARCHAR(255) NOT NULL,
    quality_score FLOAT DEFAULT 0.0,
    completeness_score FLOAT DEFAULT 0.0,
    accuracy_score FLOAT DEFAULT 0.0,
    consistency_score FLOAT DEFAULT 0.0,
    timeliness_score FLOAT DEFAULT 0.0,
    validity_score FLOAT DEFAULT 0.0,
    column_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    ml_insights JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quality_metrics_data_source ON quality_metrics(data_source_id);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_table_name ON quality_metrics(table_name);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_created_at ON quality_metrics(created_at);

-- Create quality alerts table
CREATE TABLE IF NOT EXISTS quality_alerts (
    id SERIAL PRIMARY KEY,
    metric_id INTEGER NOT NULL REFERENCES quality_metrics(id) ON DELETE CASCADE,
    column_name VARCHAR(255),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by VARCHAR(255),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quality_alerts_metric ON quality_alerts(metric_id);
CREATE INDEX IF NOT EXISTS idx_quality_alerts_column ON quality_alerts(column_name);
CREATE INDEX IF NOT EXISTS idx_quality_alerts_type ON quality_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_quality_alerts_severity ON quality_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_quality_alerts_created_at ON quality_alerts(created_at);

-- Create quality thresholds table
CREATE TABLE IF NOT EXISTS quality_thresholds (
    id SERIAL PRIMARY KEY,
    metric_id INTEGER NOT NULL REFERENCES quality_metrics(id) ON DELETE CASCADE,
    dimension VARCHAR(100) NOT NULL,
    min_threshold FLOAT NOT NULL,
    max_threshold FLOAT NOT NULL,
    warning_threshold FLOAT,
    critical_threshold FLOAT,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quality_thresholds_metric ON quality_thresholds(metric_id);
CREATE INDEX IF NOT EXISTS idx_quality_thresholds_dimension ON quality_thresholds(dimension);

-- Create quality trends table
CREATE TABLE IF NOT EXISTS quality_trends (
    id SERIAL PRIMARY KEY,
    metric_id INTEGER NOT NULL REFERENCES quality_metrics(id) ON DELETE CASCADE,
    trend_type VARCHAR(100) NOT NULL,
    value FLOAT NOT NULL,
    direction VARCHAR(50) NOT NULL,
    strength FLOAT NOT NULL,
    prediction JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quality_trends_metric ON quality_trends(metric_id);
CREATE INDEX IF NOT EXISTS idx_quality_trends_type ON quality_trends(trend_type);
CREATE INDEX IF NOT EXISTS idx_quality_trends_created_at ON quality_trends(created_at);

-- Insert default quality dimensions
INSERT INTO quality_dimensions (name, description, weight)
VALUES 
    ('completeness', 'Measures the presence of required data elements', 1.0),
    ('accuracy', 'Measures how well data reflects the real-world', 1.0),
    ('consistency', 'Measures data uniformity across the dataset', 1.0),
    ('timeliness', 'Measures how current and relevant the data is', 1.0),
    ('validity', 'Measures adherence to business rules and formats', 1.0)
ON CONFLICT ON CONSTRAINT quality_dimensions_name_key DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON quality_metrics TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON quality_dimensions TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON quality_alerts TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON quality_thresholds TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON quality_trends TO app_user;

GRANT USAGE, SELECT ON SEQUENCE quality_metrics_id_seq TO app_user;
GRANT USAGE, SELECT ON SEQUENCE quality_dimensions_id_seq TO app_user;
GRANT USAGE, SELECT ON SEQUENCE quality_alerts_id_seq TO app_user;
GRANT USAGE, SELECT ON SEQUENCE quality_thresholds_id_seq TO app_user;
GRANT USAGE, SELECT ON SEQUENCE quality_trends_id_seq TO app_user;
