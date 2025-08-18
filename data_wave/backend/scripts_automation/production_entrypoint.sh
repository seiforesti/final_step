#!/bin/bash

echo "🚀 Enterprise Data Governance Backend - Production Mode"
echo "📅 $(date)"
echo "=================================================="

# Set environment variables for production
export PYTHONPATH="/app:/app/app:$PYTHONPATH"
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@postgres:5432/data_governance}"
export DB_URL="${DB_URL:-$DATABASE_URL}"
export ENVIRONMENT="${ENVIRONMENT:-production}"
export LOG_LEVEL="${LOG_LEVEL:-INFO}"

echo "🔧 Production Environment Configuration:"
echo "   DATABASE_URL: $DATABASE_URL"
echo "   ENVIRONMENT: $ENVIRONMENT"
echo "   LOG_LEVEL: $LOG_LEVEL"
echo "   PYTHONPATH: $PYTHONPATH"
echo ""

# Function to check database connectivity
check_database_connectivity() {
    echo "⏳ Checking database connectivity..."
    
    # Try to connect to PostgreSQL
    python -c "
import time
import psycopg2
import os
import sys

max_retries = 30
retry_delay = 2

for attempt in range(max_retries):
    try:
        print(f'🔌 Attempting database connection (attempt {attempt + 1}/{max_retries})...')
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        conn.close()
        print('✅ Database connection successful!')
        sys.exit(0)
    except Exception as e:
        if attempt < max_retries - 1:
            print(f'⚠️ Connection attempt {attempt + 1} failed: {e}')
            print(f'🔄 Waiting {retry_delay} seconds before retry...')
            time.sleep(retry_delay)
        else:
            print(f'❌ Database connection failed after {max_retries} attempts')
            print(f'Error: {e}')
            sys.exit(1)
"
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to connect to database - exiting"
        exit 1
    fi
}

# Function to run advanced database fix
run_database_fix() {
    echo ""
    echo "🔧 Running Advanced Database Fix System..."
    
    # Check if the fix script exists
    if [ ! -f "advanced_db_fix.py" ]; then
        echo "❌ Advanced database fix script not found"
        exit 1
    fi
    
    # Run the advanced database fix
    python advanced_db_fix.py
    
    if [ $? -eq 0 ]; then
        echo "✅ Advanced database fix completed successfully!"
        return 0
    else
        echo "❌ Advanced database fix failed"
        return 1
    fi
}

# Function to start the backend application
start_backend() {
    echo ""
    echo "🚀 Starting Enterprise Data Governance Backend..."
    
    # Check if main.py exists
    if [ ! -f "app/main.py" ]; then
        echo "❌ Main application file not found"
        exit 1
    fi
    
    # Start the FastAPI application with production settings
    exec python -m uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --workers 1 \
        --log-level $LOG_LEVEL \
        --access-log \
        --use-colors \
        --reload
}

# Function to run health check
run_health_check() {
    echo ""
    echo "🔍 Running system health check..."
    
    # Check if all required files exist
    required_files=(
        "app/main.py"
        "app/db_session.py"
        "app/models/__init__.py"
        "advanced_db_fix.py"
    )
    
    missing_files=()
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        echo "❌ Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "   - $file"
        done
        exit 1
    fi
    
    echo "✅ All required files present"
    
    # Check Python syntax
    echo "🔍 Checking Python syntax..."
    python -m py_compile app/main.py
    if [ $? -ne 0 ]; then
        echo "❌ Syntax error in main.py"
        exit 1
    fi
    
    python -m py_compile app/db_session.py
    if [ $? -ne 0 ]; then
        echo "❌ Syntax error in db_session.py"
        exit 1
    fi
    
    echo "✅ Python syntax check passed"
}

# Main execution flow
main() {
    echo "🚀 Starting Enterprise Data Governance Backend..."
    
    # Step 1: Health check
    run_health_check
    
    # Step 2: Check database connectivity
    check_database_connectivity
    
    # Step 3: Run advanced database fix
    if ! run_database_fix; then
        echo "❌ Database fix failed - cannot proceed"
        exit 1
    fi
    
    # Step 4: Start backend application
    start_backend
}

# Run main function
main
