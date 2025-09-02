-- Create required base tables and sequences first
CREATE TABLE IF NOT EXISTS ml_model_configurations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create role if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user'
   ) THEN
      CREATE ROLE app_user LOGIN PASSWORD 'app_password';
   END IF;
END
$do$;

-- Migration moved to 06_add_session_id_to_racine_collaboration_sessions.sql