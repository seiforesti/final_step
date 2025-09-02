-- Create API Keys Table
-- This script creates the api_keys table in the data_governance database

-- Check if table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'api_keys'
    ) THEN
        -- Create the api_keys table
        CREATE TABLE api_keys (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            name VARCHAR(255) NOT NULL,
            key TEXT NOT NULL,
            permissions JSONB,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP,
            last_used TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- Create indexes
        CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
        CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
        CREATE INDEX idx_api_keys_key ON api_keys(key);

        RAISE NOTICE 'api_keys table created successfully!';
    ELSE
        RAISE NOTICE 'api_keys table already exists!';
    END IF;
END $$;

