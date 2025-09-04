#!/usr/bin/env python3
"""
Simple database connectivity test.
"""

import os
import sys

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

def test_database_connection():
    """Test basic database connection."""
    try:
        # Try to import and test database connection
        from app.db_session import engine
        from sqlalchemy import text
        
        print("🔍 Testing database connection...")
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test"))
            row = result.fetchone()
            if row and row[0] == 1:
                print("✅ Database connection test: PASSED")
                return True
            else:
                print("❌ Database connection test: FAILED - Unexpected result")
                return False
                
    except Exception as e:
        print(f"❌ Database connection test: FAILED - {e}")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)
