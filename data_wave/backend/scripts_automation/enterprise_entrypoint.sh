#!/bin/bash

echo "🚀 Enterprise Data Governance Backend Container Starting..."
echo "📅 $(date)"
echo "=================================================="

# Set environment variables
export PYTHONPATH="/app:/app/app:$PYTHONPATH"
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@postgres:5432/data_governance}"
export DB_URL="${DB_URL:-$DATABASE_URL}"

echo "🔧 Environment Configuration:"
echo "   DATABASE_URL: $DATABASE_URL"
echo "   PYTHONPATH: $PYTHONPATH"
echo ""

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
python -c "
import time
import psycopg2
import os

max_retries = 30
for attempt in range(max_retries):
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        conn.close()
        print('✅ Database is ready!')
        break
    except Exception as e:
        if attempt < max_retries - 1:
            print(f'⏳ Database not ready (attempt {attempt + 1}/{max_retries}), waiting...')
            time.sleep(2)
        else:
            print(f'❌ Database connection failed after {max_retries} attempts')
            exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Failed to connect to database - exiting"
    exit 1
fi

echo ""
echo "🔧 Starting Enterprise Database Initialization..."

# Run the enterprise database initialization
python enterprise_database_init.py

if [ $? -eq 0 ]; then
    echo "✅ Database initialization completed successfully!"
    echo ""
    echo "🚀 Starting Enterprise Data Governance Backend..."
    
    # Start the main application
    exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "❌ Database initialization failed - exiting"
    exit 1
fi
