#!/usr/bin/env python3
"""
Safe startup script for the backend application.
Handles database and serialization issues gracefully.
"""

import os
import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

def safe_startup():
    """Safe startup sequence that handles errors gracefully."""
    
    print("🚀 Starting backend application safely...")
    
    try:
        # Import and start the application
        from app.main import app
        import uvicorn
        
        print("✅ Application imported successfully")
        
        # Start the server
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            log_level="info",
            access_log=True
        )
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        print(f"❌ Startup failed: {e}")
        print("🔧 Try running the fixes again or check the logs")
        sys.exit(1)

if __name__ == "__main__":
    safe_startup()
