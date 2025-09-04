# PowerShell script to restart services and fix connection pool issues
# Run this as Administrator if needed

Write-Host "🔄 Data Governance Backend Service Restart Script" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        docker version | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to check service status
function Get-ServiceStatus {
    Write-Host "📊 Checking service status..." -ForegroundColor Yellow
    
    try {
        $containers = docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        Write-Host $containers -ForegroundColor White
    } catch {
        Write-Host "❌ Error checking containers: $_" -ForegroundColor Red
    }
}

# Function to stop services
function Stop-Services {
    Write-Host "🛑 Stopping services..." -ForegroundColor Yellow
    
    try {
        # Stop backend first
        Write-Host "   Stopping backend..." -ForegroundColor Yellow
        docker stop data_governance_backend 2>$null
        docker rm data_governance_backend 2>$null
        
        # Stop PostgreSQL
        Write-Host "   Stopping PostgreSQL..." -ForegroundColor Yellow
        docker stop data_governance_postgres 2>$null
        
        # Stop other services
        Write-Host "   Stopping other services..." -ForegroundColor Yellow
        docker stop data_governance_redis 2>$null
        docker stop data_governance_elasticsearch 2>$null
        
        Write-Host "✅ Services stopped successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error stopping services: $_" -ForegroundColor Red
    }
}

# Function to start services
function Start-Services {
    Write-Host "🚀 Starting services..." -ForegroundColor Yellow
    
    try {
        # Start PostgreSQL first
        Write-Host "   Starting PostgreSQL..." -ForegroundColor Yellow
        docker-compose up -d postgres
        
        # Wait for PostgreSQL to be ready
        Write-Host "   Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        # Start Redis
        Write-Host "   Starting Redis..." -ForegroundColor Yellow
        docker-compose up -d redis
        
        # Start Elasticsearch
        Write-Host "   Starting Elasticsearch..." -ForegroundColor Yellow
        docker-compose up -d elasticsearch
        
        # Wait for services to be ready
        Start-Sleep -Seconds 20
        
        # Start backend last
        Write-Host "   Starting backend..." -ForegroundColor Yellow
        docker-compose up -d backend
        
        Write-Host "✅ Services started successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error starting services: $_" -ForegroundColor Red
    }
}

# Function to check logs
function Show-Logs {
    Write-Host "📋 Showing recent logs..." -ForegroundColor Yellow
    
    try {
        Write-Host "Backend logs:" -ForegroundColor Cyan
        docker logs --tail 20 data_governance_backend 2>$null
        
        Write-Host "`nPostgreSQL logs:" -ForegroundColor Cyan
        docker logs --tail 10 data_governance_postgres 2>$null
    } catch {
        Write-Host "❌ Error showing logs: $_" -ForegroundColor Red
    }
}

# Function to run connection pool fix
function Fix-ConnectionPool {
    Write-Host "🔧 Running connection pool fix..." -ForegroundColor Yellow
    
    try {
        # Run the Python fix script
        Write-Host "   Running quick_fix_db_pool.py..." -ForegroundColor Yellow
        python quick_fix_db_pool.py
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Connection pool fix completed successfully" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Connection pool fix had issues" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error running connection pool fix: $_" -ForegroundColor Red
    }
}

# Main execution
try {
    # Check if Docker is running
    if (-not (Test-DockerRunning)) {
        Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
    
    # Check current status
    Get-ServiceStatus
    
    Write-Host "`nChoose an option:" -ForegroundColor Cyan
    Write-Host "1. Quick restart (stop and start)" -ForegroundColor White
    Write-Host "2. Full restart with connection pool fix" -ForegroundColor White
    Write-Host "3. Show logs only" -ForegroundColor White
    Write-Host "4. Run connection pool fix only" -ForegroundColor White
    Write-Host "5. Exit" -ForegroundColor White
    
    $choice = Read-Host "`nEnter your choice (1-5)"
    
    switch ($choice) {
        "1" {
            Write-Host "`n🔄 Performing quick restart..." -ForegroundColor Cyan
            Stop-Services
            Start-Sleep -Seconds 5
            Start-Services
            Start-Sleep -Seconds 10
            Get-ServiceStatus
        }
        "2" {
            Write-Host "`n🔄 Performing full restart with connection pool fix..." -ForegroundColor Cyan
            Stop-Services
            Start-Sleep -Seconds 5
            Start-Services
            Start-Sleep -Seconds 10
            Fix-ConnectionPool
            Start-Sleep -Seconds 5
            Get-ServiceStatus
        }
        "3" {
            Show-Logs
        }
        "4" {
            Fix-ConnectionPool
        }
        "5" {
            Write-Host "👋 Exiting..." -ForegroundColor Cyan
            exit 0
        }
        default {
            Write-Host "❌ Invalid choice. Please enter 1-5." -ForegroundColor Red
        }
    }
    
    Write-Host "`n🎯 Operation completed!" -ForegroundColor Green
    Write-Host "   Check the logs above for any errors." -ForegroundColor White
    Write-Host "   If issues persist, try the full restart option." -ForegroundColor White
    
} catch {
    Write-Host "❌ Unexpected error: $_" -ForegroundColor Red
    exit 1
}
