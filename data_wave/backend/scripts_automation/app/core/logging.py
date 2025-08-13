"""
Structured Logging for Enterprise Services

This module provides structured logging capabilities for enterprise services.
"""

import logging
import json
from typing import Any, Dict, Optional
from datetime import datetime
from contextvars import ContextVar

# Context variables for request tracking
request_id: ContextVar[str] = ContextVar('request_id', default='')
user_id: ContextVar[str] = ContextVar('user_id', default='')
session_id: ContextVar[str] = ContextVar('session_id', default='')


class StructuredLogger:
    """Structured logger for enterprise services with context awareness"""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
        self.name = name
    
    def _format_message(self, message: str, **kwargs) -> str:
        """Format log message with structured data"""
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "logger": self.name,
            "message": message,
            "request_id": request_id.get(),
            "user_id": user_id.get(),
            "session_id": session_id.get()
        }
        
        # Add additional context
        for key, value in kwargs.items():
            if value is not None:
                log_data[key] = value
        
        return json.dumps(log_data, default=str)
    
    def debug(self, message: str, **kwargs) -> None:
        """Log debug message"""
        if self.logger.isEnabledFor(logging.DEBUG):
            formatted_message = self._format_message(message, level="DEBUG", **kwargs)
            self.logger.debug(formatted_message)
    
    def info(self, message: str, **kwargs) -> None:
        """Log info message"""
        if self.logger.isEnabledFor(logging.INFO):
            formatted_message = self._format_message(message, level="INFO", **kwargs)
            self.logger.info(formatted_message)
    
    def warning(self, message: str, **kwargs) -> None:
        """Log warning message"""
        if self.logger.isEnabledFor(logging.WARNING):
            formatted_message = self._format_message(message, level="WARNING", **kwargs)
            self.logger.warning(formatted_message)
    
    def error(self, message: str, **kwargs) -> None:
        """Log error message"""
        if self.logger.isEnabledFor(logging.ERROR):
            formatted_message = self._format_message(message, level="ERROR", **kwargs)
            self.logger.error(formatted_message)
    
    def critical(self, message: str, **kwargs) -> None:
        """Log critical message"""
        if self.logger.isEnabledFor(logging.CRITICAL):
            formatted_message = self._format_message(message, level="CRITICAL", **kwargs)
            self.logger.critical(formatted_message)
    
    def exception(self, message: str, **kwargs) -> None:
        """Log exception message with traceback"""
        if self.logger.isEnabledFor(logging.ERROR):
            formatted_message = self._format_message(message, level="EXCEPTION", **kwargs)
            self.logger.exception(formatted_message)
    
    def log_metric(self, metric_name: str, value: float, **kwargs) -> None:
        """Log metric data"""
        metric_data = {
            "metric_name": metric_name,
            "value": value,
            "type": "metric"
        }
        metric_data.update(kwargs)
        
        formatted_message = self._format_message("Metric recorded", **metric_data)
        self.logger.info(formatted_message)
    
    def log_event(self, event_type: str, event_data: Dict[str, Any], **kwargs) -> None:
        """Log structured event data"""
        event_log = {
            "event_type": event_type,
            "event_data": event_data,
            "type": "event"
        }
        event_log.update(kwargs)
        
        formatted_message = self._format_message(f"Event: {event_type}", **event_log)
        self.logger.info(formatted_message)
    
    def log_performance(self, operation: str, duration_ms: float, **kwargs) -> None:
        """Log performance metrics"""
        perf_data = {
            "operation": operation,
            "duration_ms": duration_ms,
            "type": "performance"
        }
        perf_data.update(kwargs)
        
        formatted_message = self._format_message(f"Performance: {operation}", **perf_data)
        self.logger.info(formatted_message)
    
    def log_security(self, action: str, resource: str, outcome: str, **kwargs) -> None:
        """Log security-related events"""
        security_data = {
            "action": action,
            "resource": resource,
            "outcome": outcome,
            "type": "security"
        }
        security_data.update(kwargs)
        
        formatted_message = self._format_message(f"Security: {action} on {resource}", **security_data)
        self.logger.info(formatted_message)
    
    def log_audit(self, action: str, target: str, changes: Dict[str, Any], **kwargs) -> None:
        """Log audit trail events"""
        audit_data = {
            "action": action,
            "target": target,
            "changes": changes,
            "type": "audit"
        }
        audit_data.update(kwargs)
        
        formatted_message = self._format_message(f"Audit: {action} on {target}", **audit_data)
        self.logger.info(formatted_message)
    
    def set_context(self, **context_vars) -> None:
        """Set context variables for logging"""
        for key, value in context_vars.items():
            if key == 'request_id':
                request_id.set(value)
            elif key == 'user_id':
                user_id.set(value)
            elif key == 'session_id':
                session_id.set(value)
    
    def clear_context(self) -> None:
        """Clear all context variables"""
        request_id.set('')
        user_id.set('')
        session_id.set('')
    
    def get_context(self) -> Dict[str, str]:
        """Get current context variables"""
        return {
            "request_id": request_id.get(),
            "user_id": user_id.get(),
            "session_id": session_id.get()
        }


# Convenience functions for setting context
def set_request_context(request_id_val: str = '', user_id_val: str = '', session_id_val: str = '') -> None:
    """Set request context for logging"""
    if request_id_val:
        request_id.set(request_id_val)
    if user_id_val:
        user_id.set(user_id_val)
    if session_id_val:
        session_id.set(session_id_val)


def clear_request_context() -> None:
    """Clear request context for logging"""
    request_id.set('')
    user_id.set('')
    session_id.set('')


def get_request_context() -> Dict[str, str]:
    """Get current request context"""
    return {
        "request_id": request_id.get(),
        "user_id": user_id.get(),
        "session_id": session_id.get()
    }

