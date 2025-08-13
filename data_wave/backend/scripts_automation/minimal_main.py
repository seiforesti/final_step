#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.abspath('.'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PurSight - Enterprise Data Governance Platform (Minimal Mode)",
    version="2.0.0",
    description="Minimal startup mode for testing and development"
)

# Add CORS middleware
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    logger.info("✅ Enterprise Data Governance Platform Root endpoint called")
    return {
        "message": "Enterprise Data Governance Platform - Minimal Mode",
        "status": "running",
        "version": "2.0.0"
    }

@app.get("/health")
async def health_check():
    """Enterprise health check endpoint."""
    return {
        "status": "healthy",
        "platform": "PurSight Enterprise Data Governance - Minimal Mode",
        "version": "2.0.0",
        "mode": "minimal_startup"
    }

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Enterprise Data Governance Platform (Minimal Mode) started successfully!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("minimal_main:app", host="0.0.0.0", port=8000, reload=True)