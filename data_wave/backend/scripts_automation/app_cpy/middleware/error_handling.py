"""
Error handling middleware for FastAPI.
Catches and handles serialization errors gracefully.
"""

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from app.core.serialization import safe_json_response
import logging
import traceback

logger = logging.getLogger(__name__)

async def error_handling_middleware(request: Request, call_next):
    """Middleware to handle serialization and other errors."""
    
    try:
        response = await call_next(request)
        return response
        
    except Exception as e:
        error_msg = str(e)
        
        # Handle ModelField serialization errors
        if ("ModelField" in error_msg or 
            "not iterable" in error_msg or 
            "vars() argument must have __dict__" in error_msg or
            "object is not iterable" in error_msg or
            "jsonable_encoder" in error_msg):
            logger.error(f"Serialization error: {error_msg}")
            logger.error(f"Request path: {request.url.path}")
            logger.error(f"Request method: {request.method}")
            
            # Try to provide more helpful error information
            error_details = {
                "error": "Serialization error",
                "message": "The response could not be serialized properly",
                "details": "ModelField or object serialization issue detected",
                "path": request.url.path,
                "method": request.method,
                "timestamp": traceback.format_exc()
            }
            
            return JSONResponse(
                status_code=500,
                content=safe_json_response(error_details)
            )
        
        # Handle database connection errors
        if "database" in error_msg.lower() or "connection" in error_msg.lower():
            logger.error(f"Database error: {error_msg}")
            return JSONResponse(
                status_code=503,
                content={
                    "error": "Database error",
                    "message": "Database connection issue",
                    "details": "Please try again later"
                }
            )
        
        # Handle other errors
        logger.error(f"Unexpected error: {error_msg}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "message": "An unexpected error occurred",
                "details": "Please check the logs for more information"
            }
        )
