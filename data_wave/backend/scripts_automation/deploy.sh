#!/bin/bash

# ========================================
# ENTERPRISE DATA GOVERNANCE BACKEND DEPLOYMENT
# ========================================
# This script implements both dependency solutions:
# Option 1: Python 3.11 Compatibility (Immediate)
# Option 2: Modern Stack Migration (Future)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Python version
check_python_version() {
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
        echo $PYTHON_VERSION
    else
        echo "0.0"
    fi
}

# Function to check Docker
check_docker() {
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker is available and running"
}

# Function to check Docker Compose
check_docker_compose() {
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker Compose is available"
}

# Function to implement Option 1: Python 3.11 Compatibility
implement_option_1() {
    print_status "Implementing Option 1: Python 3.11 Compatibility"
    
    # Check if we're in a Python 3.11 environment
    PYTHON_VERSION=$(check_python_version)
    
    if [[ "$PYTHON_VERSION" == "3.11" ]]; then
        print_success "Python 3.11 detected - perfect for Option 1"
    else
        print_warning "Python $PYTHON_VERSION detected. Option 1 requires Python 3.11"
        print_status "Consider using Docker for consistent Python 3.11 environment"
    fi
    
    # Install dependencies for Option 1
    print_status "Installing Option 1 dependencies..."
    
    if [[ -f "app/requirements.txt" ]]; then
        # Create virtual environment if it doesn't exist
        if [[ ! -d "venv" ]]; then
            print_status "Creating virtual environment..."
            python3 -m venv venv
        fi
        
        # Activate virtual environment
        source venv/bin/activate
        
        # Upgrade pip
        pip install --upgrade pip
        
        # Install dependencies
        print_status "Installing Python dependencies..."
        pip install -r app/requirements.txt
        
        print_success "Option 1 dependencies installed successfully"
    else
        print_error "requirements.txt not found"
        exit 1
    fi
}

# Function to implement Option 2: Modern Stack Migration
implement_option_2() {
    print_status "Implementing Option 2: Modern Stack Migration"
    
    # Check Python version for Option 2
    PYTHON_VERSION=$(check_python_version)
    
    if [[ "$PYTHON_VERSION" == "3.13" ]] || [[ "$PYTHON_VERSION" == "3.12" ]]; then
        print_success "Python $PYTHON_VERSION detected - suitable for Option 2"
    else
        print_warning "Python $PYTHON_VERSION detected. Option 2 works best with Python 3.12+"
    fi
    
    # Create modern requirements file
    print_status "Creating modern requirements file..."
    
    cat > app/requirements-modern.txt << 'EOF'
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
EOF
    
    print_success "Modern requirements file created"
    print_warning "Note: Code migration required for Pydantic 2.x compatibility"
}

# Function to deploy with Docker
deploy_with_docker() {
    print_status "Deploying with Docker (Option 1)"
    
    # Check Docker and Docker Compose
    check_docker
    check_docker_compose
    
    # Build and start services
    print_status "Building and starting services..."
    
    if command_exists docker-compose; then
        docker-compose up --build -d
    else
        docker compose up --build -d
    fi
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    print_status "Checking service health..."
    
    # Check backend
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed - may still be starting"
    fi
    
    # Check database
    if docker exec data_governance_postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_success "PostgreSQL is ready"
    else
        print_warning "PostgreSQL may still be starting"
    fi
    
    # Check Redis
    if docker exec data_governance_redis redis-cli ping >/dev/null 2>&1; then
        print_success "Redis is ready"
    else
        print_warning "Redis may still be starting"
    fi
    
    print_success "Docker deployment completed"
    print_status "Services available at:"
    echo "  - Backend API: http://localhost:8000"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - Elasticsearch: http://localhost:9200"
    echo "  - Kafka: localhost:9092"
    echo "  - MongoDB: localhost:27017"
    echo "  - Prometheus: http://localhost:9090"
    echo "  - Grafana: http://localhost:3000 (admin/admin)"
}

# Function to deploy locally
deploy_locally() {
    print_status "Deploying locally (Option 1)"
    
    # Implement Option 1
    implement_option_1
    
    # Check if main.py exists
    if [[ ! -f "app/main.py" ]]; then
        print_error "main.py not found. Cannot start application locally."
        exit 1
    fi
    
    print_status "Starting application locally..."
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Start the application
    cd app
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
}

# Function to show deployment status
show_status() {
    print_status "Checking deployment status..."
    
    # Check if Docker containers are running
    if command_exists docker; then
        print_status "Docker containers:"
        if command_exists docker-compose; then
            docker-compose ps
        else
            docker compose ps
        fi
    fi
    
    # Check if local services are running
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        print_success "Backend API is running locally"
    else
        print_warning "Backend API is not running locally"
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    
    if command_exists docker; then
        if command_exists docker-compose; then
            docker-compose down
        else
            docker compose down
        fi
        print_success "Docker services stopped"
    fi
    
    # Kill local processes if any
    pkill -f "uvicorn main:app" 2>/dev/null || true
    print_success "Local services stopped"
}

# Function to show help
show_help() {
    echo "Enterprise Data Governance Backend Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  docker     Deploy using Docker (Option 1 - Python 3.11)"
    echo "  local      Deploy locally (Option 1 - Python 3.11)"
    echo "  modern     Prepare for modern stack migration (Option 2)"
    echo "  status     Show deployment status"
    echo "  stop       Stop all services"
    echo "  help       Show this help message"
    echo ""
    echo "Dependency Solutions:"
    echo "  Option 1: Python 3.11 compatibility (immediate deployment)"
    echo "  Option 2: Modern stack migration (future enhancement)"
    echo ""
    echo "Examples:"
    echo "  $0 docker    # Deploy with Docker"
    echo "  $0 local     # Deploy locally"
    echo "  $0 status    # Check status"
}

# Main script logic
case "${1:-help}" in
    docker)
        deploy_with_docker
        ;;
    local)
        deploy_locally
        ;;
    modern)
        implement_option_2
        ;;
    status)
        show_status
        ;;
    stop)
        stop_services
        ;;
    help|*)
        show_help
        ;;
esac

