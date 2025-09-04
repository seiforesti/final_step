#!/usr/bin/env python3
"""
Quick Database Connection Pool Fix
Emergency script to resolve connection pool exhaustion issues.
"""

import os
import sys
import time
import psycopg2
from psycopg2 import OperationalError
import logging

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_db_connection():
    """Get a direct database connection for emergency operations."""
    try:
        # Try multiple connection methods
        connection_strings = [
            "postgresql://postgres:postgres@data_governance_postgres:5432/data_governance",
            "postgresql://postgres:postgres@localhost:5432/data_governance",
            "postgresql://postgres:postgres@127.0.0.1:5432/data_governance"
        ]
        
        for conn_str in connection_strings:
            try:
                logger.info(f"Trying connection: {conn_str}")
                conn = psycopg2.connect(conn_str)
                logger.info("✅ Database connection successful!")
                return conn
            except Exception as e:
                logger.warning(f"Connection failed: {e}")
                continue
        
        raise Exception("All connection attempts failed")
        
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return None

def check_postgres_connections(conn):
    """Check current PostgreSQL connection status."""
    try:
        with conn.cursor() as cursor:
            # Check current connections
            cursor.execute("""
                SELECT 
                    count(*) as total_connections,
                    count(*) FILTER (WHERE state = 'active') as active_connections,
                    count(*) FILTER (WHERE state = 'idle') as idle_connections,
                    count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
                    count(*) FILTER (WHERE state = 'disabled') as disabled_connections
                FROM pg_stat_activity 
                WHERE datname = 'data_governance'
            """)
            
            result = cursor.fetchone()
            if result:
                total, active, idle, idle_txn, disabled = result
                logger.info(f"📊 Connection Status:")
                logger.info(f"   Total: {total}")
                logger.info(f"   Active: {active}")
                logger.info(f"   Idle: {idle}")
                logger.info(f"   Idle in Transaction: {idle_txn}")
                logger.info(f"   Disabled: {disabled}")
                
                return {
                    'total': total,
                    'active': active,
                    'idle': idle,
                    'idle_txn': idle_txn,
                    'disabled': disabled
                }
            
    except Exception as e:
        logger.error(f"Error checking connections: {e}")
        return None

def kill_idle_connections(conn, max_idle_time_minutes=5):
    """Kill idle connections that have been idle for too long."""
    try:
        with conn.cursor() as cursor:
            # Find and kill idle connections
            cursor.execute("""
                SELECT 
                    pid,
                    usename,
                    application_name,
                    client_addr,
                    state,
                    state_change,
                    EXTRACT(EPOCH FROM (now() - state_change))/60 as idle_minutes
                FROM pg_stat_activity 
                WHERE datname = 'data_governance' 
                AND state = 'idle'
                AND EXTRACT(EPOCH FROM (now() - state_change))/60 > %s
                AND pid <> pg_backend_pid()
            """, (max_idle_time_minutes,))
            
            idle_connections = cursor.fetchall()
            
            if not idle_connections:
                logger.info("✅ No long-idle connections found")
                return 0
            
            logger.info(f"🔍 Found {len(idle_connections)} long-idle connections:")
            killed_count = 0
            
            for conn_info in idle_connections:
                pid, user, app, client, state, state_change, idle_mins = conn_info
                logger.info(f"   PID {pid}: {user}@{client} ({app}) - idle for {idle_mins:.1f} minutes")
                
                try:
                    cursor.execute("SELECT pg_terminate_backend(%s)", (pid,))
                    if cursor.rowcount > 0:
                        killed_count += 1
                        logger.info(f"   ✅ Killed PID {pid}")
                    else:
                        logger.warning(f"   ❌ Failed to kill PID {pid}")
                except Exception as e:
                    logger.error(f"   ❌ Error killing PID {pid}: {e}")
            
            logger.info(f"✅ Killed {killed_count} idle connections")
            return killed_count
            
    except Exception as e:
        logger.error(f"Error killing idle connections: {e}")
        return 0

def kill_idle_transactions(conn, max_idle_time_minutes=2):
    """Kill connections that are idle in transaction for too long."""
    try:
        with conn.cursor() as cursor:
            # Find and kill idle in transaction connections
            cursor.execute("""
                SELECT 
                    pid,
                    usename,
                    application_name,
                    client_addr,
                    state,
                    state_change,
                    EXTRACT(EPOCH FROM (now() - state_change))/60 as idle_minutes
                FROM pg_stat_activity 
                WHERE datname = 'data_governance' 
                AND state = 'idle in transaction'
                AND EXTRACT(EPOCH FROM (now() - state_change))/60 > %s
                AND pid <> pg_backend_pid()
            """, (max_idle_time_minutes,))
            
            idle_txn_connections = cursor.fetchall()
            
            if not idle_txn_connections:
                logger.info("✅ No long-idle transactions found")
                return 0
            
            logger.info(f"🔍 Found {len(idle_txn_connections)} long-idle transactions:")
            killed_count = 0
            
            for conn_info in idle_txn_connections:
                pid, user, app, client, state, state_change, idle_mins = conn_info
                logger.info(f"   PID {pid}: {user}@{client} ({app}) - idle in transaction for {idle_mins:.1f} minutes")
                
                try:
                    cursor.execute("SELECT pg_terminate_backend(%s)", (pid,))
                    if cursor.rowcount > 0:
                        killed_count += 1
                        logger.info(f"   ✅ Killed PID {pid}")
                    else:
                        logger.warning(f"   ❌ Failed to kill PID {pid}")
                except Exception as e:
                    logger.error(f"   ❌ Error killing PID {pid}: {e}")
            
            logger.info(f"✅ Killed {killed_count} idle transaction connections")
            return killed_count
            
    except Exception as e:
        logger.error(f"Error killing idle transactions: {e}")
        return 0

def reset_connection_pool():
    """Reset the connection pool by killing all non-essential connections."""
    try:
        conn = get_db_connection()
        if not conn:
            logger.error("❌ Cannot reset pool without database connection")
            return False
        
        logger.info("🔄 Starting connection pool reset...")
        
        # Check current status
        initial_status = check_postgres_connections(conn)
        if not initial_status:
            logger.error("❌ Cannot determine current connection status")
            return False
        
        # Kill idle connections first
        killed_idle = kill_idle_connections(conn, max_idle_time_minutes=1)
        
        # Kill idle transactions
        killed_txn = kill_idle_transactions(conn, max_idle_time_minutes=1)
        
        # Wait a moment for connections to close
        time.sleep(2)
        
        # Check final status
        final_status = check_postgres_connections(conn)
        if final_status:
            logger.info("📊 Final Connection Status:")
            logger.info(f"   Total: {final_status['total']} (was {initial_status['total']})")
            logger.info(f"   Active: {final_status['active']} (was {initial_status['active']})")
            logger.info(f"   Idle: {final_status['idle']} (was {initial_status['idle']})")
            logger.info(f"   Idle in Transaction: {final_status['idle_txn']} (was {initial_status['idle_txn']})")
        
        conn.close()
        logger.info("✅ Connection pool reset completed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error during connection pool reset: {e}")
        return False

def main():
    """Main function to fix the connection pool issue."""
    logger.info("🚀 Starting Database Connection Pool Fix...")
    
    # Try to connect first
    conn = get_db_connection()
    if not conn:
        logger.error("❌ Cannot connect to database. Check if PostgreSQL is running.")
        return False
    
    try:
        # Check initial status
        logger.info("📊 Checking initial connection status...")
        initial_status = check_postgres_connections(conn)
        
        if initial_status and initial_status['total'] > 50:
            logger.warning("⚠️  High connection count detected. Starting aggressive cleanup...")
            
            # Kill long-idle connections
            killed_idle = kill_idle_connections(conn, max_idle_time_minutes=2)
            
            # Kill long-idle transactions
            killed_txn = kill_idle_transactions(conn, max_idle_time_minutes=1)
            
            # Wait for cleanup to take effect
            time.sleep(3)
            
            # Check final status
            final_status = check_postgres_connections(conn)
            if final_status:
                logger.info("📊 After cleanup:")
                logger.info(f"   Total: {final_status['total']} (was {initial_status['total']})")
                logger.info(f"   Active: {final_status['active']} (was {initial_status['active']})")
                logger.info(f"   Idle: {final_status['idle']} (was {initial_status['idle']})")
                logger.info(f"   Idle in Transaction: {final_status['idle_txn']} (was {initial_status['idle_txn']})")
            
            if final_status and final_status['total'] < 30:
                logger.info("✅ Connection pool cleanup successful!")
                return True
            else:
                logger.warning("⚠️  Connection count still high. Consider restarting the backend service.")
                return False
        else:
            logger.info("✅ Connection count is within normal limits")
            return True
            
    except Exception as e:
        logger.error(f"❌ Error during cleanup: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    success = main()
    if success:
        logger.info("🎉 Database connection pool fix completed successfully!")
        sys.exit(0)
    else:
        logger.error("💥 Database connection pool fix failed!")
        sys.exit(1)



