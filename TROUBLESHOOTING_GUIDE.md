# Data Governance Backend Troubleshooting Guide

## Overview
This guide provides solutions for common issues encountered with the Data Governance backend services running in Docker containers.

## Quick Fix Commands

### 1. Restart All Services
```bash
# Stop all services
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml down

# Start with optimized configuration
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml up -d
```

### 2. Check Service Status
```bash
# View all containers
docker ps -a

# Check resource usage
docker stats --no-stream

# View service logs
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml logs -f
```

## Common Issues and Solutions

### 1. Elasticsearch Timer Thread Warnings
**Problem**: `timer thread slept for [23.1s/23183ms] on absolute clock which is above the warn threshold of [5000ms]`

**Cause**: Resource constraints, high memory pressure, or JVM configuration issues

**Solutions**:
- ✅ **Implemented**: Increased JVM heap from 512MB to 1GB
- ✅ **Implemented**: Added resource limits (2GB memory, 1 CPU)
- ✅ **Implemented**: Optimized JVM garbage collection settings
- ✅ **Implemented**: Added disk watermark configurations

**Manual Fix**:
```bash
# Restart Elasticsearch with new configuration
docker restart data_governance_elasticsearch

# Check JVM settings
docker exec data_governance_elasticsearch java -XX:+PrintFlagsFinal -version | grep -i heapsize
```

### 2. PostgreSQL Connection Issues
**Problem**: `invalid length of startup packet`

**Cause**: Malformed connection attempts, protocol mismatches, or connection pool issues

**Solutions**:
- ✅ **Implemented**: Optimized PostgreSQL configuration
- ✅ **Implemented**: Added connection limits and memory settings
- ✅ **Implemented**: Improved health checks
- ✅ **Implemented**: Added resource constraints

**Manual Fix**:
```bash
# Check PostgreSQL logs
docker logs data_governance_postgres --tail 50

# Test connection
docker exec data_governance_postgres pg_isready -U postgres -d data_governance

# Restart PostgreSQL
docker restart data_governance_postgres
```

### 3. Zookeeper Connection Errors
**Problem**: `EndOfStreamException: Unable to read additional data from client`

**Cause**: Network connectivity issues, client disconnections, or resource constraints

**Solutions**:
- ✅ **Implemented**: Added connection limits and timeout settings
- ✅ **Implemented**: Optimized tick time and sync limits
- ✅ **Implemented**: Added resource constraints
- ✅ **Implemented**: Improved health checks

**Manual Fix**:
```bash
# Check Zookeeper status
docker exec data_governance_zookeeper echo ruok | nc localhost 2181

# Restart Zookeeper
docker restart data_governance_zookeeper

# Check network connectivity
docker network inspect data_governance_network
```

### 4. High Memory Usage
**Problem**: Backend container using excessive memory (4.4GB+)

**Cause**: Memory leaks, inefficient code, or insufficient resource limits

**Solutions**:
- ✅ **Implemented**: Added memory limits (2GB max, 1GB reserved)
- ✅ **Implemented**: Added CPU limits (1 CPU max, 0.5 reserved)
- ✅ **Implemented**: Improved health checks and monitoring

**Manual Fix**:
```bash
# Check memory usage
docker stats --no-stream

# Restart backend with resource limits
docker restart data_governance_backend

# Monitor memory growth
docker stats data_governance_backend --no-stream
```

## Performance Optimization

### 1. Resource Allocation
```yaml
# Example resource limits for production
deploy:
  resources:
    limits:
      memory: 4G
      cpus: '2.0'
    reservations:
      memory: 2G
      cpus: '1.0'
```

### 2. Database Optimization
```sql
-- PostgreSQL performance tuning
ALTER SYSTEM SET shared_buffers = '1GB';
ALTER SYSTEM SET effective_cache_size = '4GB';
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET maintenance_work_mem = '256MB';
SELECT pg_reload_conf();
```

### 3. Elasticsearch Tuning
```yaml
# Elasticsearch JVM optimization
ES_JAVA_OPTS: >
  -Xms2g 
  -Xmx2g 
  -XX:+UseG1GC 
  -XX:G1ReservePercent=25 
  -XX:MaxGCPauseMillis=200
  -XX:+UnlockExperimentalVMOptions
  -XX:+UseCGroupMemoryLimitForHeap
```

## Monitoring and Diagnostics

### 1. Health Check Endpoints
- **Backend**: `http://localhost:8000/health`
- **Elasticsearch**: `http://localhost:9200/_cluster/health`
- **PostgreSQL**: `pg_isready -U postgres -d data_governance`
- **Redis**: `redis-cli ping`
- **Kafka**: `kafka-topics --bootstrap-server localhost:9092 --list`

### 2. Log Analysis
```bash
# View real-time logs
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml logs -f

# View specific service logs
docker logs data_governance_postgres --tail 100 -f
docker logs data_governance_elasticsearch --tail 100 -f
docker logs data_governance_backend --tail 100 -f
```

### 3. Resource Monitoring
```bash
# Continuous monitoring
docker stats

# Network inspection
docker network inspect data_governance_network

# Volume usage
docker system df
```

## Preventive Measures

### 1. Regular Maintenance
- Monitor resource usage daily
- Check logs for warnings/errors
- Restart services weekly during maintenance windows
- Clean up old logs and containers

### 2. Scaling Considerations
- Monitor CPU and memory usage trends
- Plan for resource increases before hitting limits
- Consider horizontal scaling for high-traffic periods
- Implement proper load balancing

### 3. Backup and Recovery
- Regular database backups
- Configuration file backups
- Container image versioning
- Disaster recovery procedures

## Emergency Procedures

### 1. Service Unavailable
```bash
# Quick restart
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml restart

# Force restart
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml down
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml up -d
```

### 2. Data Loss Prevention
```bash
# Stop all services
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml down

# Backup volumes
docker run --rm -v data_governance_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restart services
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml up -d
```

### 3. Network Issues
```bash
# Recreate network
docker network rm data_governance_network
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml up -d

# Check DNS resolution
docker exec data_governance_backend nslookup postgres
```

## Support and Resources

### 1. Documentation
- Docker Compose reference
- PostgreSQL tuning guide
- Elasticsearch optimization guide
- Kafka configuration reference

### 2. Monitoring Tools
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001` (admin/admin)
- **Custom Scripts**: `monitor_services.ps1`

### 3. Log Locations
- Container logs: `docker logs <container_name>`
- Application logs: `./logs/` directory
- Database logs: PostgreSQL container logs
- System logs: Docker daemon logs

---

**Last Updated**: August 26, 2025
**Version**: 1.0
**Maintainer**: Data Governance Team
