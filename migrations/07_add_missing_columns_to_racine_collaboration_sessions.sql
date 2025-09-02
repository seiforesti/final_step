-- Add missing columns to racine_collaboration_sessions (guarded)
DO $$
BEGIN
    -- workspace_id
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'workspace_id'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN workspace_id INTEGER;
    END IF;

    -- session_name
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'session_name'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN session_name VARCHAR(255);
    END IF;

    -- session_type
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'session_type'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN session_type VARCHAR(100);
    END IF;

    -- description
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'description'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN description TEXT;
    END IF;

    -- status
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'status'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;

    -- started_at
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'started_at'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- ended_at
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'ended_at'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN ended_at TIMESTAMPTZ;
    END IF;

    -- last_activity
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'last_activity'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN last_activity TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- session_config
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'session_config'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN session_config JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- max_participants
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'max_participants'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN max_participants INTEGER;
    END IF;

    -- is_private
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'is_private'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN is_private BOOLEAN DEFAULT FALSE;
    END IF;

    -- active_documents
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'active_documents'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN active_documents JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- current_activities
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'current_activities'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN current_activities JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- session_metadata
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'session_metadata'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN session_metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- created_at
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'created_at'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- updated_at
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;



