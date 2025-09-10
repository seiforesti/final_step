"""
Standard API response models for enterprise routes.
"""

from typing import Any, Optional, Dict
from pydantic import BaseModel, Field


class SuccessResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
    data: Any = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[Any] = None


class StandardResponse(BaseModel):
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Response message")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Response data")
    error: Optional[str] = Field(default=None, description="Error message if any")


__all__ = ["SuccessResponse", "ErrorResponse", "StandardResponse"]


