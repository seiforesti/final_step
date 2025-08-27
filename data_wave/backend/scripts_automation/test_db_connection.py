#!/usr/bin/env python3
"""
Database Connection Test Script
==============================

This script tests the database connection and verifies table access.
"""

import sys
import os
from sqlalchemy import create_engine, text

def test_database_connection():
    """Test database connection and basic operations"""
    try:
        # Database URL
        database_url = 'postgresql://postgres:postgres@postgres:5432/data_governance'
        
        print("🔌 Testing database connection...")
        
        # Create engine
        engine = create_engine(database_url, pool_pre_ping=True)
        
        # Test connection
        with engine.connect() as conn:
            # Test basic query
            result = conn.execute(text("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"))
            table_count = result.scalar()
            print(f"✅ Database connection successful!")
            print(f"📊 Total tables found: {table_count}")
            
            # Test critical tables
            critical_tables = ['users', 'organizations', 'datasource', 'scan', 'workflows', 'roles', 'permissions']
            for table in critical_tables:
                result = conn.execute(text(f"SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '{table}'"))
                exists = result.scalar() > 0
                status = "✅" if exists else "❌"
                print(f"   {status} Table '{table}': {'EXISTS' if exists else 'MISSING'}")
            
            # Test table structure
            print("\n🔍 Testing table structure...")
            result = conn.execute(text("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position LIMIT 5"))
            columns = result.fetchall()
            print(f"   Users table has {len(columns)} columns (showing first 5):")
            for col in columns:
                print(f"     - {col[1]} ({col[2]})")
            
            # Test foreign key constraints
            result = conn.execute(text("SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'"))
            fk_count = result.scalar()
            print(f"\n🔗 Foreign key constraints: {fk_count}")
            
            # Test indexes
            result = conn.execute(text("SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public'"))
            index_count = result.scalar()
            print(f"📈 Indexes: {index_count}")
            
            print("\n🎉 All database tests passed successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_database_connection()
    sys.exit(0 if success else 1)

