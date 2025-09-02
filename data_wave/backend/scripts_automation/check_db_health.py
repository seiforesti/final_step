#!/usr/bin/env python3
"""
Database Health Check Script
Checks database connectivity and connection pool status
"""

import os
import sys
import time
import psycopg2
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, TimeoutError

# Add the app directory to the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))

def check_direct_postgres():
    """Check direct PostgreSQL connection"""
    try:
        # Try direct connection
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            database="data_governance",
            user="postgres",
            password="postgres",
            connect_timeout=10
        )
        cursor = conn.cursor()
        cursor.execute("SELECT version()")
        version = cursor.fetchone()
        cursor.close()
        conn.close()
        print("✅ Direct PostgreSQL connection successful")
        print(f"   Version: {version[0]}")
        return True
    except Exception as e:
        print(f"❌ Direct PostgreSQL connection failed: {e}")
        return False

def check_sqlalchemy_pool():
    """Check SQLAlchemy connection pool"""
    try:
        from app.db_session import engine
        
        # Check pool status
        pool_size = engine.pool.size()
        checked_in = engine.pool.checkedin()
        checked_out = engine.pool.checkedout()
        overflow = engine.pool.overflow()
        
        print("📊 SQLAlchemy Connection Pool Status:")
        print(f"   Pool Size: {pool_size}")
        print(f"   Checked In: {checked_in}")
        print(f"   Checked Out: {checked_out}")
        print(f"   Overflow: {overflow}")
        print(f"   Total Available: {pool_size + overflow}")
        print(f"   Usage: {checked_out}/{pool_size + overflow}")
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 as test"))
            test_value = result.fetchone()
            if test_value[0] == 1:
                print("✅ SQLAlchemy connection test successful")
                return True
            else:
                print("❌ SQLAlchemy connection test failed")
                return False
                
    except Exception as e:
        print(f"❌ SQLAlchemy pool check failed: {e}")
        return False

def check_connection_limits():
    """Check PostgreSQL connection limits"""
    try:
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            database="data_governance",
            user="postgres",
            password="postgres",
            connect_timeout=10
        )
        cursor = conn.cursor()
        
        # Check max connections
        cursor.execute("SHOW max_connections")
        max_conn = cursor.fetchone()[0]
        
        # Check current connections
        cursor.execute("SELECT count(*) FROM pg_stat_activity")
        current_conn = cursor.fetchone()[0]
        
        # Check active connections
        cursor.execute("SELECT count(*) FROM pg_stat_activity WHERE state = 'active'")
        active_conn = cursor.fetchone()[0]
        
        print("🔌 PostgreSQL Connection Limits:")
        print(f"   Max Connections: {max_conn}")
        print(f"   Current Connections: {current_conn}")
        print(f"   Active Connections: {active_conn}")
        print(f"   Available: {int(max_conn) - current_conn}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection limits check failed: {e}")
        return False

def stress_test_connections():
    """Test multiple concurrent connections"""
    print("\n🧪 Testing concurrent connections...")
    
    connections = []
    max_test_connections = 20
    
    try:
        for i in range(max_test_connections):
            try:
                conn = psycopg2.connect(
                    host="localhost",
                    port="5432",
                    database="data_governance",
                    user="postgres",
                    password="postgres",
                    connect_timeout=5
                )
                connections.append(conn)
                print(f"   Connection {i+1}: ✅")
            except Exception as e:
                print(f"   Connection {i+1}: ❌ {e}")
                break
        
        print(f"\n📈 Successfully established {len(connections)} connections")
        
        # Test queries on all connections
        for i, conn in enumerate(connections):
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                cursor.fetchone()
                cursor.close()
                print(f"   Query test {i+1}: ✅")
            except Exception as e:
                print(f"   Query test {i+1}: ❌ {e}")
        
        return len(connections)
        
    finally:
        # Close all connections
        for conn in connections:
            try:
                conn.close()
            except:
                pass
        print(f"   Closed {len(connections)} connections")

def main():
    """Main health check function"""
    print("🏥 Database Health Check Starting...")
    print("=" * 50)
    
    # Check direct PostgreSQL
    postgres_ok = check_direct_postgres()
    print()
    
    # Check SQLAlchemy pool
    sqlalchemy_ok = check_sqlalchemy_pool()
    print()
    
    # Check connection limits
    limits_ok = check_connection_limits()
    print()
    
    # Stress test
    if postgres_ok and sqlalchemy_ok:
        stress_test_connections()
    
    print("\n" + "=" * 50)
    print("📋 Health Check Summary:")
    print(f"   PostgreSQL: {'✅' if postgres_ok else '❌'}")
    print(f"   SQLAlchemy: {'✅' if sqlalchemy_ok else '❌'}")
    print(f"   Limits: {'✅' if limits_ok else '❌'}")
    
    if postgres_ok and sqlalchemy_ok:
        print("\n🎉 Database is healthy!")
        return 0
    else:
        print("\n⚠️  Database has issues that need attention")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)



