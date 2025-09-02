# Data Governance Services Startup Script
# This script ensures all services are running and properly configured

Write-Host "🚀 Starting Data Governance Services..." -ForegroundColor Green

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Stop existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down --remove-orphans

# Start services
Write-Host "Starting services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host "Checking service health..." -ForegroundColor Yellow

# Check backend health
$maxAttempts = 10
$attempt = 0
$backendHealthy = $false

while ($attempt -lt $maxAttempts -and -not $backendHealthy) {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            $backendHealthy = $true
            Write-Host "✅ Backend is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "⏳ Backend not ready yet (attempt $attempt/$maxAttempts)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $backendHealthy) {
    Write-Host "❌ Backend failed to start properly" -ForegroundColor Red
    Write-Host "Checking container logs..." -ForegroundColor Yellow
    docker-compose logs datagovernance-backend
    exit 1
}

# Check frontend health
$maxAttempts = 10
$attempt = 0
$frontendHealthy = $false

while ($attempt -lt $maxAttempts -and -not $frontendHealthy) {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            $frontendHealthy = $true
            Write-Host "✅ Frontend is healthy" -ForegroundColor Green
        }
    } catch {
        Write-Host "⏳ Frontend not ready yet (attempt $attempt/$maxAttempts)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $frontendHealthy) {
    Write-Host "❌ Frontend failed to start properly" -ForegroundColor Red
    Write-Host "Checking container logs..." -ForegroundColor Yellow
    docker-compose logs frontend
    exit 1
}

# Check proxy connectivity
Write-Host "Testing proxy connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/proxy/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Proxy is working correctly" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Proxy test failed, but services are running" -ForegroundColor Yellow
}

# Show service status
Write-Host "`n📊 Service Status:" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "Proxy Health: http://localhost:3000/proxy/health" -ForegroundColor White

Write-Host "`n✅ All services are running successfully!" -ForegroundColor Green
Write-Host "The system should now work without the previous errors." -ForegroundColor Green



