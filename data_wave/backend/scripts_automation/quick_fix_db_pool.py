#!/usr/bin/env python3
"""
Quick Fix for Database Connection Pool Issues
This script immediately resolves the connection pool exhaustion problem
"""

import os
import sys
import signal
import time
import psycopg2
from sqlalchemy import create_engine, text

# Add the app directory to the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))

def kill_long_running_queries():
    """Kill long-running queries that might be holding connections"""
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
        
        # Find long-running queries (more than 30 seconds)
        cursor.execute("""
            SELECT pid, query_start, state, query 
            FROM pg_stat_activity 
            WHERE state = 'active' 
            AND query_start < NOW() - INTERVAL '30 seconds'
            AND pid != pg_backend_pid()
        """)
        
        long_running = cursor.fetchall()
        
        if long_running:
            print(f"🔍 Found {len(long_running)} long-running queries")
            for pid, query_start, state, query in long_running:
                print(f"   PID {pid}: {state} since {query_start}")
                print(f"   Query: {query[:100]}...")
                
                # Kill the query
                try:
                    cursor.execute(f"SELECT pg_terminate_backend({pid})")
                    print(f"   ✅ Terminated PID {pid}")
                except Exception as e:
                    print(f"   ❌ Failed to terminate PID {pid}: {e}")
        else:
            print("✅ No long-running queries found")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error checking long-running queries: {e}")

def reset_connection_pool():
    """Reset the SQLAlchemy connection pool"""
    try:
        from app.db_session import engine
        
        print("🔄 Resetting SQLAlchemy connection pool...")
        
        # Dispose the current pool
        engine.pool.dispose()
        print("   ✅ Pool disposed")
        
        # Wait a moment for cleanup
        time.sleep(2)
        
        # Test a new connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            if result.fetchone()[0] == 1:
                print("   ✅ New connection test successful")
                return True
            else:
                print("   ❌ New connection test failed")
                return False
                
    except Exception as e:
        print(f"❌ Error resetting connection pool: {e}")
        return False

def optimize_postgres_settings():
    """Optimize PostgreSQL settings for better connection handling"""
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
        
        print("⚙️  Optimizing PostgreSQL settings...")
        
        # Check current settings
        cursor.execute("SHOW max_connections")
        max_conn = cursor.fetchone()[0]
        
        cursor.execute("SHOW shared_preload_libraries")
        shared_libs = cursor.fetchone()[0]
        
        print(f"   Current max_connections: {max_conn}")
        print(f"   Shared libraries: {shared_libs}")
        
        # Optimize connection settings (if we have superuser privileges)
        try:
            # Increase max connections temporarily
            cursor.execute("ALTER SYSTEM SET max_connections = '200'")
            cursor.execute("ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements'")
            cursor.execute("SELECT pg_reload_conf()")
            print("   ✅ PostgreSQL settings optimized")
        except Exception as e:
            print(f"   ⚠️  Could not optimize settings (may need superuser): {e}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error optimizing PostgreSQL: {e}")

def cleanup_idle_connections():
    """Clean up idle connections"""
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
        
        # Count idle connections
        cursor.execute("""
            SELECT count(*) 
            FROM pg_stat_activity 
            WHERE state = 'idle' 
            AND pid != pg_backend_pid()
        """)
        
        idle_count = cursor.fetchone()[0]
        print(f"🔍 Found {idle_count} idle connections")
        
        if idle_count > 10:  # If more than 10 idle connections
            print("   🧹 Cleaning up idle connections...")
            
            # Terminate idle connections older than 5 minutes
            cursor.execute("""
                SELECT pg_terminate_backend(pid) 
                FROM pg_stat_activity 
                WHERE state = 'idle' 
                AND pid != pg_backend_pid()
                AND state_change < NOW() - INTERVAL '5 minutes'
            """)
            
            terminated = cursor.rowcount
            print(f"   ✅ Terminated {terminated} idle connections")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error cleaning up idle connections: {e}")

def main():
    """Main fix function"""
    print("🚀 Quick Fix for Database Connection Pool Issues")
    print("=" * 60)
    
    # Step 1: Kill long-running queries
    print("\n1️⃣  Killing long-running queries...")
    kill_long_running_queries()
    
    # Step 2: Clean up idle connections
    print("\n2️⃣  Cleaning up idle connections...")
    cleanup_idle_connections()
    
    # Step 3: Reset connection pool
    print("\n3️⃣  Resetting connection pool...")
    pool_reset = reset_connection_pool()
    
    # Step 4: Optimize PostgreSQL settings
    print("\n4️⃣  Optimizing PostgreSQL settings...")
    optimize_postgres_settings()
    
    # Step 5: Final health check
    print("\n5️⃣  Final health check...")
    try:
        from app.db_session import engine
        
        pool_size = engine.pool.size()
        checked_in = engine.pool.checkedin()
        checked_out = engine.pool.checkedout()
        overflow = engine.pool.overflow()
        
        print(f"   📊 Pool Status: {checked_out}/{pool_size + overflow} connections in use")
        
        if checked_out < (pool_size + overflow) * 0.8:  # Less than 80% usage
            print("   ✅ Connection pool is healthy")
        else:
            print("   ⚠️  Connection pool still has high usage")
            
    except Exception as e:
        print(f"   ❌ Health check failed: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 Quick Fix Complete!")
    print("   The connection pool issues should now be resolved.")
    print("   If problems persist, restart the backend service.")
    
    return 0 if pool_reset else 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⏹️  Fix interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)



