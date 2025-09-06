#!/usr/bin/env python3
"""
Update Backend Configuration for PgBouncer
==========================================

Updates backend configuration to use PgBouncer connection pooling
without recreating the container.
"""

import os
import docker
import logging
import time
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def update_backend_environment():
    """Update backend container environment variables for PgBouncer"""
    
    try:
        docker_client = docker.from_env()
        backend_container = docker_client.containers.get("data_governance_backend")
        
        logger.info("🔄 Updating backend environment variables for PgBouncer...")
        
        # Get current environment
        current_env = backend_container.attrs['Config']['Env']
        new_env = []
        
        # Update environment variables
        for env_var in current_env:
            if env_var.startswith('DATABASE_URL='):
                new_env.append('DATABASE_URL=postgresql://postgres:postgres@data_governance_pgbouncer:6432/data_governance')
                logger.info("✅ Updated DATABASE_URL to use PgBouncer")
            elif env_var.startswith('DB_URL='):
                new_env.append('DB_URL=postgresql://postgres:postgres@data_governance_pgbouncer:6432/data_governance')
                logger.info("✅ Updated DB_URL to use PgBouncer")
            elif env_var.startswith('DB_POOL_SIZE='):
                new_env.append('DB_POOL_SIZE=25')  # Reduced since PgBouncer handles pooling
                logger.info("✅ Updated DB_POOL_SIZE to 25")
            elif env_var.startswith('DB_MAX_OVERFLOW='):
                new_env.append('DB_MAX_OVERFLOW=10')  # Reduced overflow
                logger.info("✅ Updated DB_MAX_OVERFLOW to 10")
            elif env_var.startswith('DB_POOL_TIMEOUT='):
                new_env.append('DB_POOL_TIMEOUT=30')  # Faster timeout
                logger.info("✅ Updated DB_POOL_TIMEOUT to 30")
            elif env_var.startswith('MAX_CONCURRENT_DB_REQUESTS='):
                new_env.append('MAX_CONCURRENT_DB_REQUESTS=50')  # Increased for PgBouncer
                logger.info("✅ Updated MAX_CONCURRENT_DB_REQUESTS to 50")
            elif env_var.startswith('DB_SEMAPHORE_TIMEOUT='):
                new_env.append('DB_SEMAPHORE_TIMEOUT=3')  # Faster semaphore timeout
                logger.info("✅ Updated DB_SEMAPHORE_TIMEOUT to 3")
            else:
                new_env.append(env_var)
        
        # Add PgBouncer specific environment variables
        new_env.extend([
            'DB_USE_PGBOUNCER=true',
            'CLEANUP_UTIL_THRESHOLD=70',
            'CLEANUP_MIN_INTERVAL_SEC=10'
        ])
        
        logger.info("✅ Added PgBouncer specific environment variables")
        
        # Update container configuration
        backend_container.update(environment=new_env)
        
        logger.info("✅ Backend environment variables updated successfully")
        return True
        
    except docker.errors.NotFound:
        logger.error("❌ Backend container not found")
        return False
    except Exception as e:
        logger.error(f"❌ Failed to update backend environment: {e}")
        return False

def restart_backend_gracefully():
    """Restart backend container gracefully"""
    
    try:
        docker_client = docker.from_env()
        backend_container = docker_client.containers.get("data_governance_backend")
        
        logger.info("🔄 Restarting backend container to apply new configuration...")
        
        # Restart container
        backend_container.restart(timeout=30)
        
        # Wait for container to be healthy
        logger.info("⏳ Waiting for backend to be healthy...")
        time.sleep(30)
        
        # Check if container is running
        backend_container.reload()
        if backend_container.status == "running":
            logger.info("✅ Backend restarted successfully")
            return True
        else:
            logger.error("❌ Backend failed to start")
            return False
            
    except Exception as e:
        logger.error(f"❌ Failed to restart backend: {e}")
        return False

def verify_backend_connection():
    """Verify backend is connected to PgBouncer"""
    
    try:
        docker_client = docker.from_env()
        backend_container = docker_client.containers.get("data_governance_backend")
        
        logger.info("🔍 Verifying backend connection to PgBouncer...")
        
        # Check backend health
        result = backend_container.exec_run("curl -f http://localhost:8000/health")
        if result.exit_code == 0:
            logger.info("✅ Backend health check passed")
            return True
        else:
            logger.error("❌ Backend health check failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ Failed to verify backend connection: {e}")
        return False

def main():
    """Main function"""
    logger.info("🚀 Updating backend configuration for PgBouncer...")
    
    # Update backend environment
    if not update_backend_environment():
        logger.error("❌ Failed to update backend environment")
        return False
    
    # Restart backend gracefully
    if not restart_backend_gracefully():
        logger.error("❌ Failed to restart backend")
        return False
    
    # Verify connection
    if not verify_backend_connection():
        logger.error("❌ Backend connection verification failed")
        return False
    
    logger.info("🎉 Backend successfully configured for PgBouncer!")
    logger.info("📊 Backend is now using PgBouncer connection pooling")
    logger.info("🔍 Monitor with: ./monitor_enterprise_database.sh")
    
    return True

if __name__ == "__main__":
    main()
