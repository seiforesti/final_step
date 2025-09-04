#!/usr/bin/env python3
"""
Database Health Check Script
Checks database connectivity and connection pool status.
"""

import os
import sys
import logging
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

def check_database_health():
    """Check database health and connection pool status."""
    try:
        from app.db_session import engine, get_connection_pool_status
        from sqlalchemy import text
        
        print("🔍 Checking database health...")
        
        # Test basic connectivity
        try:
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                print("✅ Database connectivity: OK")
        except Exception as e:
            print(f"❌ Database connectivity: FAILED - {e}")
            return False
        
        # Check connection pool status
        try:
            pool_status = get_connection_pool_status()
            print(f"📊 Connection pool status: {pool_status}")
            
            if pool_status.get('pool_size', 0) == 0:
                print("⚠️  WARNING: Pool size is 0 - this may cause connection issues")
                return False
            
            if pool_status.get('checked_out', 0) > pool_status.get('total_capacity', 1):
                print("⚠️  WARNING: More connections checked out than total capacity")
                return False
                
        except Exception as e:
            print(f"❌ Connection pool check failed: {e}")
            return False
        
        print("✅ Database health check passed")
        return True
        
    except Exception as e:
        print(f"❌ Database health check failed: {e}")
        return False

if __name__ == "__main__":
    success = check_database_health()
    sys.exit(0 if success else 1)
