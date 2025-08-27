# PowerShell script to restart data governance services with optimized configuration
# This script will stop, remove, and restart all containers with the new configuration

Write-Host "Restarting Data Governance Services with Optimized Configuration..." -ForegroundColor Yellow

# Stop and remove all existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Blue
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml down

# Clean up any dangling resources
Write-Host "Cleaning up dangling resources..." -ForegroundColor Blue
docker system prune -f

# Wait a moment for cleanup
Start-Sleep -Seconds 5

# Start services with new configuration
Write-Host "Starting services with optimized configuration..." -ForegroundColor Green
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml up -d

# Wait for services to start
Write-Host "Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service status
Write-Host "Checking service status..." -ForegroundColor Blue
docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml ps

# Check resource usage
Write-Host "Checking resource usage..." -ForegroundColor Blue
docker stats --no-stream

Write-Host "Services restarted successfully!" -ForegroundColor Green
Write-Host "Monitor logs with: docker-compose -f data_wave/backend/scripts_automation/docker-compose.yml logs -f" -ForegroundColor Cyan
