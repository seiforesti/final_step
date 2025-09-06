#!/usr/bin/env python3
"""
Update Existing Docker Compose for Enterprise Optimization
==========================================================

Modifies the existing docker-compose.yml to add PgBouncer and optimize
PostgreSQL configuration without recreating containers.
"""

import os
import shutil
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def update_docker_compose():
    """Update existing docker-compose.yml with enterprise optimizations"""
    
    project_root = Path(__file__).parent
    compose_file = project_root / "docker-compose.yml"
    backup_file = project_root / "docker-compose.yml.backup"
    
    try:
        # Create backup
        if compose_file.exists():
            shutil.copy2(compose_file, backup_file)
            logger.info("✅ Created backup of docker-compose.yml")
        
        # Read current docker-compose.yml
        with open(compose_file, 'r') as f:
            content = f.read()
        
        # Add PgBouncer service after postgres service
        pgbouncer_service = """
  # PgBouncer Connection Pooler (Enterprise Optimization)
  pgbouncer:
    image: pgbouncer/pgbouncer:latest
    container_name: data_governance_pgbouncer
    environment:
      - DATABASES_HOST=data_governance_postgres
      - DATABASES_PORT=5432
      - DATABASES_USER=postgres
      - DATABASES_PASSWORD=postgres
      - DATABASES_DBNAME=data_governance
      - POOL_MODE=transaction
      - MAX_CLIENT_CONN=1000
      - DEFAULT_POOL_SIZE=50
      - MIN_POOL_SIZE=10
      - RESERVE_POOL_SIZE=10
      - RESERVE_POOL_TIMEOUT=5
      - SERVER_CONNECT_TIMEOUT=15
      - SERVER_LOGIN_RETRY=15
      - QUERY_TIMEOUT=0
      - QUERY_WAIT_TIMEOUT=120
      - CLIENT_IDLE_TIMEOUT=0
      - CLIENT_LOGIN_TIMEOUT=60
      - AUTODB_IDLE_TIMEOUT=3600
      - LOG_CONNECTIONS=1
      - LOG_DISCONNECTIONS=1
      - LOG_POOLER_ERRORS=1
      - LOG_STATS=1
      - STATS_PERIOD=60
      - ADMIN_USERS=postgres
      - STATS_USERS=postgres
      - SERVER_RESET_QUERY=DISCARD ALL
      - SERVER_CHECK_QUERY=SELECT 1
      - SERVER_CHECK_DELAY=30
      - SERVER_LIFETIME=3600
      - SERVER_IDLE_TIMEOUT=600
      - MAX_USER_CONNECTIONS=100
    ports:
      - "6432:6432"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'
        reservations:
          memory: 128M
          cpus: '0.1'
    healthcheck:
      test: ["CMD", "pgbouncer", "-u", "postgres", "-h", "localhost", "-p", "6432", "-d", "data_governance", "-c", "SHOW VERSION;"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    volumes:
      - ./pgbouncer.conf:/etc/pgbouncer/pgbouncer.conf
      - ./userlist.txt:/etc/pgbouncer/userlist.txt
"""
        
        # Check if PgBouncer already exists
        if "pgbouncer:" in content:
            logger.info("⚠️ PgBouncer service already exists in docker-compose.yml")
            return True
        
        # Find insertion point (after postgres service)
        insertion_point = content.find("  # pgAdmin for PostgreSQL Management")
        if insertion_point == -1:
            insertion_point = content.find("  # Redis Cache")
        
        if insertion_point == -1:
            logger.error("❌ Could not find insertion point for PgBouncer service")
            return False
        
        # Insert PgBouncer service
        new_content = content[:insertion_point] + pgbouncer_service + "\n" + content[insertion_point:]
        
        # Write updated content
        with open(compose_file, 'w') as f:
            f.write(new_content)
        
        logger.info("✅ Successfully added PgBouncer service to docker-compose.yml")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to update docker-compose.yml: {e}")
        return False

def update_postgres_config():
    """Update PostgreSQL configuration"""
    
    project_root = Path(__file__).parent
    postgres_conf = project_root / "postgres.conf"
    optimized_conf = project_root / "postgres_enterprise_optimized.conf"
    
    try:
        # Create backup
        if postgres_conf.exists():
            shutil.copy2(postgres_conf, project_root / "postgres.conf.backup")
            logger.info("✅ Created backup of postgres.conf")
        
        # Copy optimized configuration
        if optimized_conf.exists():
            shutil.copy2(optimized_conf, postgres_conf)
            logger.info("✅ Updated postgres.conf with enterprise optimization")
            return True
        else:
            logger.error("❌ Optimized PostgreSQL configuration not found")
            return False
            
    except Exception as e:
        logger.error(f"❌ Failed to update postgres.conf: {e}")
        return False

def main():
    """Main function"""
    logger.info("🚀 Updating existing Docker Compose for enterprise optimization...")
    
    # Update docker-compose.yml
    if update_docker_compose():
        logger.info("✅ Docker Compose updated successfully")
    else:
        logger.error("❌ Failed to update Docker Compose")
        return False
    
    # Update PostgreSQL configuration
    if update_postgres_config():
        logger.info("✅ PostgreSQL configuration updated successfully")
    else:
        logger.error("❌ Failed to update PostgreSQL configuration")
        return False
    
    logger.info("🎉 Enterprise optimization configuration applied successfully!")
    logger.info("📋 Next steps:")
    logger.info("   1. Start PgBouncer: docker-compose up -d pgbouncer")
    logger.info("   2. Restart PostgreSQL: docker-compose restart postgres")
    logger.info("   3. Update backend to use PgBouncer: docker-compose restart backend")
    logger.info("   4. Monitor with: ./monitor_enterprise_database.sh")
    
    return True

if __name__ == "__main__":
    main()
