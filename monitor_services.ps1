# PowerShell script to monitor data governance services performance
# This script provides real-time monitoring of container health and resource usage

param(
    [int]$RefreshInterval = 30,
    [switch]$Continuous
)

function Show-Header {
    Clear-Host
    Write-Host "🔍 Data Governance Services Monitor" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "Refresh Interval: $RefreshInterval seconds" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to exit" -ForegroundColor Red
    Write-Host ""
}

function Get-ContainerStatus {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host "📊 Container Status:" -ForegroundColor Green
    Write-Host $containers
    Write-Host ""
}

function Get-ResourceUsage {
    $stats = docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
    Write-Host "💾 Resource Usage:" -ForegroundColor Green
    Write-Host $stats
    Write-Host ""
}

function Get-HealthChecks {
    Write-Host "🏥 Health Check Status:" -ForegroundColor Green
    
    # Check PostgreSQL
    try {
        $pgHealth = docker exec data_governance_postgres pg_isready -U postgres -d data_governance 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL: Healthy" -ForegroundColor Green
        } else {
            Write-Host "❌ PostgreSQL: Unhealthy" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ PostgreSQL: Error checking health" -ForegroundColor Red
    }
    
    # Check Redis
    try {
        $redisHealth = docker exec data_governance_redis redis-cli ping 2>$null
        if ($redisHealth -eq "PONG") {
            Write-Host "✅ Redis: Healthy" -ForegroundColor Green
        } else {
            Write-Host "❌ Redis: Unhealthy" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Redis: Error checking health" -ForegroundColor Red
    }
    
    # Check Elasticsearch
    try {
        $esHealth = Invoke-RestMethod -Uri "http://localhost:9200/_cluster/health" -Method GET -TimeoutSec 5 2>$null
        if ($esHealth.status -eq "green" -or $esHealth.status -eq "yellow") {
            Write-Host "✅ Elasticsearch: $($esHealth.status)" -ForegroundColor Green
        } else {
            Write-Host "❌ Elasticsearch: $($esHealth.status)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Elasticsearch: Error checking health" -ForegroundColor Red
    }
    
    # Check Kafka
    try {
        $kafkaHealth = docker exec data_governance_kafka kafka-topics --bootstrap-server localhost:9092 --list 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Kafka: Healthy" -ForegroundColor Green
        } else {
            Write-Host "❌ Kafka: Unhealthy" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Kafka: Error checking health" -ForegroundColor Red
    }
    
    Write-Host ""
}

function Get-SystemInfo {
    Write-Host "🖥️  System Information:" -ForegroundColor Green
    Write-Host "Docker Version: $(docker --version)" -ForegroundColor White
    Write-Host "Docker Compose Version: $(docker-compose --version)" -ForegroundColor White
    Write-Host "Total Containers: $(docker ps -q | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor White
    Write-Host "Total Images: $(docker images -q | Measure-Object | Select-Object -ExpandProperty Count)" -ForegroundColor White
    Write-Host ""
}

function Get-LatestLogs {
    Write-Host "📝 Latest Logs (Last 5 lines):" -ForegroundColor Green
    
    # PostgreSQL logs
    Write-Host "🐘 PostgreSQL:" -ForegroundColor Yellow
    $pgLogs = docker logs data_governance_postgres --tail 5 2>$null
    if ($pgLogs) {
        $pgLogs | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
    
    # Elasticsearch logs
    Write-Host "🔍 Elasticsearch:" -ForegroundColor Yellow
    $esLogs = docker logs data_governance_elasticsearch --tail 5 2>$null
    if ($esLogs) {
        $esLogs | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
    
    Write-Host ""
}

# Main monitoring loop
do {
    Show-Header
    Get-SystemInfo
    Get-ContainerStatus
    Get-ResourceUsage
    Get-HealthChecks
    Get-LatestLogs
    
    if ($Continuous) {
        Write-Host "⏳ Refreshing in $RefreshInterval seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds $RefreshInterval
    } else {
        break
    }
} while ($Continuous)

Write-Host "👋 Monitoring completed!" -ForegroundColor Green
