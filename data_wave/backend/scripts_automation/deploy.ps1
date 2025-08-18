# ========================================
# ENTERPRISE DATA GOVERNANCE BACKEND DEPLOYMENT (PowerShell)
# ========================================
# This script implements both dependency solutions:
# Option 1: Python 3.11 Compatibility (Immediate)
# Option 2: Modern Stack Migration (Future)

param(
    [Parameter(Position=0)]
    [ValidateSet("docker", "local", "modern", "status", "stop", "help")]
    [string]$Action = "help"
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to check Python version
function Get-PythonVersion {
    if (Test-Command "python") {
        try {
            $version = python --version 2>&1
            if ($version -match "Python (\d+\.\d+)") {
                return $matches[1]
            }
        }
        catch {
            # Ignore errors
        }
    }
    return "0.0"
}

# Function to check Docker
function Test-Docker {
    if (-not (Test-Command "docker")) {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        return $false
    }
    
    try {
        docker info | Out-Null
        Write-Success "Docker is available and running"
        return $true
    }
    catch {
        Write-Error "Docker is not running. Please start Docker Desktop first."
        return $false
    }
}

# Function to check Docker Compose
function Test-DockerCompose {
    if ((Test-Command "docker-compose") -or (docker compose version 2>$null)) {
        Write-Success "Docker Compose is available"
        return $true
    }
    else {
        Write-Error "Docker Compose is not available. Please install Docker Compose first."
        return $false
    }
}

# Function to implement Option 1: Python 3.11 Compatibility
function Implement-Option1 {
    Write-Status "Implementing Option 1: Python 3.11 Compatibility"
    
    # Check if we're in a Python 3.11 environment
    $pythonVersion = Get-PythonVersion
    
    if ($pythonVersion -eq "3.11") {
        Write-Success "Python 3.11 detected - perfect for Option 1"
    }
    else {
        Write-Warning "Python $pythonVersion detected. Option 1 requires Python 3.11"
        Write-Status "Consider using Docker for consistent Python 3.11 environment"
    }
    
    # Install dependencies for Option 1
    Write-Status "Installing Option 1 dependencies..."
    
    if (Test-Path "app/requirements.txt") {
        # Create virtual environment if it doesn't exist
        if (-not (Test-Path "venv")) {
            Write-Status "Creating virtual environment..."
            python -m venv venv
        }
        
        # Activate virtual environment
        Write-Status "Activating virtual environment..."
        & "venv\Scripts\Activate.ps1"
        
        # Upgrade pip
        python -m pip install --upgrade pip
        
        # Install dependencies
        Write-Status "Installing Python dependencies..."
        pip install -r app/requirements.txt
        
        Write-Success "Option 1 dependencies installed successfully"
    }
    else {
        Write-Error "requirements.txt not found"
        exit 1
    }
}

# Function to implement Option 2: Modern Stack Migration
function Implement-Option2 {
    Write-Status "Implementing Option 2: Modern Stack Migration"
    
    # Check Python version for Option 2
    $pythonVersion = Get-PythonVersion
    
    if ($pythonVersion -eq "3.13" -or $pythonVersion -eq "3.12") {
        Write-Success "Python $pythonVersion detected - suitable for Option 2"
    }
    else {
        Write-Warning "Python $pythonVersion detected. Option 2 works best with Python 3.12+"
    }
    
    # Create modern requirements file
    Write-Status "Creating modern requirements file..."
    
    $modernRequirements = @"
# ========================================
# MODERN STACK DEPENDENCIES (Option 2)
# ========================================
# For Python 3.12+ and modern performance

# Modern FastAPI and Web Framework
fastapi>=0.115.0
pydantic>=2.11.0
pydantic-settings>=2.0.0
uvicorn[standard]>=0.27.0

# Modern Database ORM
sqlmodel>=0.0.25
sqlalchemy>=2.0.23
psycopg2-binary>=2.9.7
pymysql>=1.1.0
pymongo>=4.5.0

# Enterprise AI/ML (Modern versions)
numpy>=1.24.0
scipy>=1.10.0
scikit-learn>=1.3.0
transformers>=4.35.0
torch>=2.1.0
sentence-transformers>=2.2.0

# Data Processing (Modern versions)
pandas>=2.0.0
dask>=2023.8.0
pyarrow>=14.0.0

# All other dependencies from main requirements.txt
# (Copy the rest of the enterprise dependencies)
"@
    
    $modernRequirements | Out-File -FilePath "app/requirements-modern.txt" -Encoding UTF8
    
    Write-Success "Modern requirements file created"
    Write-Warning "Note: Code migration required for Pydantic 2.x compatibility"
}

# Function to deploy with Docker
function Deploy-WithDocker {
    Write-Status "Deploying with Docker (Option 1)"
    
    # Check Docker and Docker Compose
    if (-not (Test-Docker)) { return }
    if (-not (Test-DockerCompose)) { return }
    
    # Build and start services
    Write-Status "Building and starting services..."
    
    if (Test-Command "docker-compose") {
        docker-compose up --build -d
    }
    else {
        docker compose up --build -d
    }
    
    # Wait for services to be ready
    Write-Status "Waiting for services to be ready..."
    Start-Sleep -Seconds 30
    
    # Check service health
    Write-Status "Checking service health..."
    
    # Check backend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend is healthy"
        }
    }
    catch {
        Write-Warning "Backend health check failed - may still be starting"
    }
    
    # Check database
    try {
        docker exec data_governance_postgres pg_isready -U postgres | Out-Null
        Write-Success "PostgreSQL is ready"
    }
    catch {
        Write-Warning "PostgreSQL may still be starting"
    }
    
    # Check Redis
    try {
        docker exec data_governance_redis redis-cli ping | Out-Null
        Write-Success "Redis is ready"
    }
    catch {
        Write-Warning "Redis may still be starting"
    }
    
    Write-Success "Docker deployment completed"
    Write-Status "Services available at:"
    Write-Host "  - Backend API: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "  - PostgreSQL: localhost:5432" -ForegroundColor Cyan
    Write-Host "  - Redis: localhost:6379" -ForegroundColor Cyan
    Write-Host "  - Elasticsearch: http://localhost:9200" -ForegroundColor Cyan
    Write-Host "  - Kafka: localhost:9092" -ForegroundColor Cyan
    Write-Host "  - MongoDB: localhost:27017" -ForegroundColor Cyan
    Write-Host "  - Prometheus: http://localhost:9090" -ForegroundColor Cyan
    Write-Host "  - Grafana: http://localhost:3000 (admin/admin)" -ForegroundColor Cyan
}

# Function to deploy locally
function Deploy-Locally {
    Write-Status "Deploying locally (Option 1)"
    
    # Implement Option 1
    Implement-Option1
    
    # Check if main.py exists
    if (-not (Test-Path "app/main.py")) {
        Write-Error "main.py not found. Cannot start application locally."
        return
    }
    
    Write-Status "Starting application locally..."
    
    # Activate virtual environment
    & "venv\Scripts\Activate.ps1"
    
    # Start the application
    Set-Location app
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
}

# Function to show deployment status
function Show-Status {
    Write-Status "Checking deployment status..."
    
    # Check if Docker containers are running
    if (Test-Command "docker") {
        Write-Status "Docker containers:"
        if (Test-Command "docker-compose") {
            docker-compose ps
        }
        else {
            docker compose ps
        }
    }
    
    # Check if local services are running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Success "Backend API is running locally"
        }
    }
    catch {
        Write-Warning "Backend API is not running locally"
    }
}

# Function to stop services
function Stop-Services {
    Write-Status "Stopping services..."
    
    if (Test-Command "docker") {
        if (Test-Command "docker-compose") {
            docker-compose down
        }
        else {
            docker compose down
        }
        Write-Success "Docker services stopped"
    }
    
    # Kill local processes if any
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "python" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Success "Local services stopped"
}

# Function to show help
function Show-Help {
    Write-Host "Enterprise Data Governance Backend Deployment Script (PowerShell)" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [OPTION]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor White
    Write-Host "  docker     Deploy using Docker (Option 1 - Python 3.11)" -ForegroundColor Cyan
    Write-Host "  local      Deploy locally (Option 1 - Python 3.11)" -ForegroundColor Cyan
    Write-Host "  modern     Prepare for modern stack migration (Option 2)" -ForegroundColor Cyan
    Write-Host "  status     Show deployment status" -ForegroundColor Cyan
    Write-Host "  stop       Stop all services" -ForegroundColor Cyan
    Write-Host "  help       Show this help message" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Dependency Solutions:" -ForegroundColor White
    Write-Host "  Option 1: Python 3.11 compatibility (immediate deployment)" -ForegroundColor Yellow
    Write-Host "  Option 2: Modern stack migration (future enhancement)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor White
    Write-Host "  .\deploy.ps1 docker    # Deploy with Docker" -ForegroundColor Green
    Write-Host "  .\deploy.ps1 local     # Deploy locally" -ForegroundColor Green
    Write-Host "  .\deploy.ps1 status    # Check status" -ForegroundColor Green
}

# Main script logic
switch ($Action) {
    "docker" { Deploy-WithDocker }
    "local" { Deploy-Locally }
    "modern" { Implement-Option2 }
    "status" { Show-Status }
    "stop" { Stop-Services }
    "help" { Show-Help }
    default { Show-Help }
}

