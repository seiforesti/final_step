-- Add session_id to racine_collaboration_sessions and unique index (guarded)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'racine_collaboration_sessions'
          AND column_name = 'session_id'
    ) THEN
        ALTER TABLE racine_collaboration_sessions
            ADD COLUMN session_id VARCHAR(255);
    END IF;

    -- Backfill session_id for existing rows if null, using deterministic value
    UPDATE racine_collaboration_sessions
    SET session_id = COALESCE(session_id, CONCAT('sess_', id::text))
    WHERE session_id IS NULL;

    -- Add unique index if not present
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'racine_collaboration_sessions'
          AND indexname = 'ux_racine_collab_sessions_session_id'
    ) THEN
        CREATE UNIQUE INDEX ux_racine_collab_sessions_session_id
        ON racine_collaboration_sessions (session_id);
    END IF;
END $$;



