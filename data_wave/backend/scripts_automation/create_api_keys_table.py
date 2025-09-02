#!/usr/bin/env python3
"""
Create API Keys Table Migration
===============================

This script creates the api_keys table in the database if it doesn't exist.
"""

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from sqlalchemy import create_engine, text
from app.db_session import get_database_url

def create_api_keys_table():
    """Create the api_keys table if it doesn't exist."""
    try:
        # Get database URL
        database_url = get_database_url()
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Check if table exists
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'api_keys'
                );
            """))
            
            table_exists = result.scalar()
            
            if not table_exists:
                print("Creating api_keys table...")
                
                # Create the api_keys table
                conn.execute(text("""
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
                """))
                
                # Create indexes
                conn.execute(text("""
                    CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
                    CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
                    CREATE INDEX idx_api_keys_key ON api_keys(key);
                """))
                
                conn.commit()
                print("✅ api_keys table created successfully!")
            else:
                print("✅ api_keys table already exists!")
                
    except Exception as e:
        print(f"❌ Error creating api_keys table: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = create_api_keys_table()
    sys.exit(0 if success else 1)

