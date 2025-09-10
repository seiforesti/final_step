"""
Enterprise Logging Configuration

Comprehensive logging system for the Enterprise Data Governance Platform
with structured logging, multiple output formats, log aggregation,
and advanced monitoring capabilities.
"""

import logging
import logging.config
import logging.handlers
import os
import json
import sys
from typing import Dict, Any, Optional, List
from datetime import datetime
import threading
import queue
import traceback
from pathlib import Path

from .config import settings

class StructuredFormatter(logging.Formatter):
    """
    Structured JSON formatter for enterprise logging.
    
    Outputs logs in JSON format with consistent structure
    for easy parsing by log aggregation systems.
    """
    
    def __init__(self, include_extra: bool = True):
        super().__init__()
        self.include_extra = include_extra
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        log_data = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line_number': record.lineno,
            'process_id': record.process,
            'thread_id': record.thread,
            'thread_name': record.threadName
        }
        
        # Add exception information if present
        if record.exc_info:
            log_data['exception'] = {
                'type': record.exc_info[0].__name__ if record.exc_info[0] else None,
                'message': str(record.exc_info[1]) if record.exc_info[1] else None,
                'traceback': traceback.format_exception(*record.exc_info)
            }
        
        # Add extra fields if enabled
        if self.include_extra:
            for key, value in record.__dict__.items():
                if key not in ['name', 'msg', 'args', 'levelname', 'levelno', 'pathname',
                              'filename', 'module', 'lineno', 'funcName', 'created',
                              'msecs', 'relativeCreated', 'thread', 'threadName',
                              'processName', 'process', 'getMessage', 'exc_info',
                              'exc_text', 'stack_info']:
                    log_data['extra'] = log_data.get('extra', {})
                    log_data['extra'][key] = value
        
        # Add application context
        log_data['application'] = {
            'name': settings.enterprise.app_name,
            'version': settings.enterprise.app_version,
            'environment': settings.enterprise.environment
        }
        
        return json.dumps(log_data, default=str, ensure_ascii=False)

class ColoredFormatter(logging.Formatter):
    """
    Colored console formatter for development environments.
    """
    
    # Color codes
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'        # Reset
    }
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record with colors."""
        if not hasattr(record, 'color'):
            record.color = self.COLORS.get(record.levelname, '')
            record.reset = self.COLORS['RESET']
        
        # Custom format with colors
        log_format = (
            '{color}[{asctime}] {levelname:8} {reset}'
            '{name:25} | {color}{message}{reset}'
        )
        
        if record.exc_info:
            log_format += '\n{color}Exception: {exc_info}{reset}'
        
        formatter = logging.Formatter(
            fmt=log_format,
            datefmt='%Y-%m-%d %H:%M:%S',
            style='{'
        )
        
        return formatter.format(record)

class AsyncFileHandler(logging.handlers.RotatingFileHandler):
    """
    Asynchronous file handler for high-performance logging.
    """
    
    def __init__(self, filename: str, mode: str = 'a', maxBytes: int = 0,
                 backupCount: int = 0, encoding: Optional[str] = None,
                 delay: bool = False, queue_size: int = 1000):
        super().__init__(filename, mode, maxBytes, backupCount, encoding, delay)
        self.queue_size = queue_size
        self.log_queue = queue.Queue(maxsize=queue_size)
        self.worker_thread = None
        self.shutdown_event = threading.Event()
        self._start_worker()
    
    def _start_worker(self):
        """Start the worker thread for async logging."""
        def worker():
            while not self.shutdown_event.is_set():
                try:
                    record = self.log_queue.get(timeout=1.0)
                    if record is None:  # Shutdown signal
                        break
                    super(AsyncFileHandler, self).emit(record)
                    self.log_queue.task_done()
                except queue.Empty:
                    continue
                except Exception as e:
                    print(f"Async logging error: {e}", file=sys.stderr)
        
        self.worker_thread = threading.Thread(target=worker, daemon=True)
        self.worker_thread.start()
    
    def emit(self, record: logging.LogRecord):
        """Emit log record asynchronously."""
        try:
            if not self.log_queue.full():
                self.log_queue.put_nowait(record)
            else:
                # Queue is full, drop the record or handle differently
                print(f"Log queue full, dropping record: {record.getMessage()}", file=sys.stderr)
        except Exception as e:
            print(f"Failed to queue log record: {e}", file=sys.stderr)
    
    def close(self):
        """Close the handler and shutdown worker thread."""
        self.shutdown_event.set()
        if self.worker_thread and self.worker_thread.is_alive():
            # Signal shutdown
            try:
                self.log_queue.put(None, timeout=5.0)
            except queue.Full:
                pass
            self.worker_thread.join(timeout=10.0)
        super().close()

class AuditLogHandler(logging.Handler):
    """
    Special handler for audit logs with enhanced security and compliance features.
    """
    
    def __init__(self, audit_file: str, enable_encryption: bool = False):
        super().__init__()
        self.audit_file = audit_file
        self.enable_encryption = enable_encryption
        self._ensure_audit_directory()
    
    def _ensure_audit_directory(self):
        """Ensure audit log directory exists."""
        audit_dir = Path(self.audit_file).parent
        audit_dir.mkdir(parents=True, exist_ok=True)
    
    def emit(self, record: logging.LogRecord):
        """Emit audit log record."""
        try:
            # Format as structured audit entry
            audit_entry = {
                'timestamp': datetime.fromtimestamp(record.created).isoformat(),
                'level': record.levelname,
                'event_type': getattr(record, 'event_type', 'unknown'),
                'user_id': getattr(record, 'user_id', None),
                'session_id': getattr(record, 'session_id', None),
                'ip_address': getattr(record, 'ip_address', None),
                'action': getattr(record, 'action', None),
                'resource': getattr(record, 'resource', None),
                'result': getattr(record, 'result', None),
                'message': record.getMessage(),
                'details': getattr(record, 'details', {}),
                'compliance_tags': getattr(record, 'compliance_tags', [])
            }
            
            # Write to audit file
            with open(self.audit_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(audit_entry, default=str) + '\n')
        
        except Exception as e:
            print(f"Audit logging error: {e}", file=sys.stderr)

class MetricsHandler(logging.Handler):
    """
    Handler that collects logging metrics for monitoring.
    """
    
    def __init__(self):
        super().__init__()
        self.metrics = {
            'total_logs': 0,
            'by_level': {
                'DEBUG': 0,
                'INFO': 0,
                'WARNING': 0,
                'ERROR': 0,
                'CRITICAL': 0
            },
            'error_rate': 0,
            'last_error': None,
            'last_critical': None
        }
        self._lock = threading.Lock()
    
    def emit(self, record: logging.LogRecord):
        """Emit and collect metrics."""
        with self._lock:
            self.metrics['total_logs'] += 1
            self.metrics['by_level'][record.levelname] += 1
            
            if record.levelname == 'ERROR':
                self.metrics['last_error'] = {
                    'timestamp': datetime.fromtimestamp(record.created).isoformat(),
                    'message': record.getMessage(),
                    'logger': record.name
                }
            elif record.levelname == 'CRITICAL':
                self.metrics['last_critical'] = {
                    'timestamp': datetime.fromtimestamp(record.created).isoformat(),
                    'message': record.getMessage(),
                    'logger': record.name
                }
            
            # Calculate error rate
            total_errors = self.metrics['by_level']['ERROR'] + self.metrics['by_level']['CRITICAL']
            self.metrics['error_rate'] = (total_errors / self.metrics['total_logs']) * 100
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics."""
        with self._lock:
            return dict(self.metrics)
    
    def reset_metrics(self):
        """Reset metrics counters."""
        with self._lock:
            self.metrics['total_logs'] = 0
            for level in self.metrics['by_level']:
                self.metrics['by_level'][level] = 0
            self.metrics['error_rate'] = 0

class EnterpriseLoggingConfig:
    """
    Enterprise logging configuration manager.
    
    Features:
    - Multiple output formats (JSON, colored console, structured)
    - Asynchronous file logging for performance
    - Audit logging with compliance features
    - Log rotation and archival
    - Metrics collection and monitoring
    - Dynamic log level management
    - Security and privacy considerations
    """
    
    def __init__(self):
        self.handlers = {}
        self.metrics_handler = MetricsHandler()
        self.audit_handler = None
        self._configured = False
        
        # Create log directories
        self._create_log_directories()
    
    def _create_log_directories(self):
        """Create necessary log directories."""
        log_dirs = [
            'logs',
            'logs/audit',
            'logs/archive',
            'logs/debug'
        ]
        
        for log_dir in log_dirs:
            Path(log_dir).mkdir(parents=True, exist_ok=True)
    
    def configure_logging(self, force_reconfigure: bool = False):
        """Configure enterprise logging system."""
        if self._configured and not force_reconfigure:
            return
        
        # Clear existing handlers
        logging.root.handlers.clear()
        
        # Get configuration
        log_level = getattr(logging, settings.monitoring.log_level.upper())
        is_development = settings.enterprise.environment == 'development'
        
        # Configure root logger
        logging.root.setLevel(log_level)
        
        # Console handler
        if is_development:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setFormatter(ColoredFormatter())
            console_handler.setLevel(log_level)
            logging.root.addHandler(console_handler)
            self.handlers['console'] = console_handler
        
        # File handlers
        if settings.monitoring.enable_metrics:
            # Main application log
            app_handler = AsyncFileHandler(
                filename='logs/application.log',
                maxBytes=50 * 1024 * 1024,  # 50MB
                backupCount=10,
                encoding='utf-8'
            )
            app_handler.setFormatter(StructuredFormatter())
            app_handler.setLevel(log_level)
            logging.root.addHandler(app_handler)
            self.handlers['application'] = app_handler
            
            # Error log
            error_handler = AsyncFileHandler(
                filename='logs/errors.log',
                maxBytes=25 * 1024 * 1024,  # 25MB
                backupCount=20,
                encoding='utf-8'
            )
            error_handler.setFormatter(StructuredFormatter())
            error_handler.setLevel(logging.ERROR)
            logging.root.addHandler(error_handler)
            self.handlers['error'] = error_handler
            
            # Debug log (development only)
            if is_development:
                debug_handler = AsyncFileHandler(
                    filename='logs/debug/debug.log',
                    maxBytes=100 * 1024 * 1024,  # 100MB
                    backupCount=5,
                    encoding='utf-8'
                )
                debug_handler.setFormatter(StructuredFormatter())
                debug_handler.setLevel(logging.DEBUG)
                logging.root.addHandler(debug_handler)
                self.handlers['debug'] = debug_handler
        
        # Audit log handler
        if settings.enterprise.enable_audit_logging:
            self.audit_handler = AuditLogHandler('logs/audit/audit.log')
            self.audit_handler.setFormatter(StructuredFormatter(include_extra=False))
            # Audit logs typically don't go to root logger
            audit_logger = logging.getLogger('audit')
            audit_logger.addHandler(self.audit_handler)
            audit_logger.setLevel(logging.INFO)
            audit_logger.propagate = False
        
        # Metrics handler
        logging.root.addHandler(self.metrics_handler)
        
        # Configure specific loggers
        self._configure_specific_loggers()
        
        self._configured = True
        logging.info("Enterprise logging system configured successfully")
    
    def _configure_specific_loggers(self):
        """Configure specific loggers for different components."""
        logger_configs = {
            'uvicorn': logging.WARNING,
            'uvicorn.access': logging.WARNING,
            'fastapi': logging.INFO,
            'sqlalchemy.engine': logging.WARNING if settings.enterprise.environment == 'production' else logging.INFO,
            'redis': logging.WARNING,
            'transformers': logging.WARNING,
            'torch': logging.WARNING,
            'tensorflow': logging.WARNING,
            'sklearn': logging.WARNING,
            'matplotlib': logging.WARNING,
            'asyncio': logging.WARNING,
            'httpx': logging.WARNING,
            'urllib3': logging.WARNING
        }
        
        for logger_name, level in logger_configs.items():
            logger = logging.getLogger(logger_name)
            logger.setLevel(level)
    
    def get_logger(self, name: str) -> logging.Logger:
        """Get a logger with enterprise configuration."""
        return logging.getLogger(name)
    
    def get_audit_logger(self) -> logging.Logger:
        """Get the audit logger."""
        return logging.getLogger('audit')
    
    def log_audit_event(
        self,
        event_type: str,
        message: str,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        action: Optional[str] = None,
        resource: Optional[str] = None,
        result: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        compliance_tags: Optional[List[str]] = None
    ):
        """Log an audit event with structured data."""
        audit_logger = self.get_audit_logger()
        
        # Create log record with extra fields
        extra = {
            'event_type': event_type,
            'user_id': user_id,
            'session_id': session_id,
            'ip_address': ip_address,
            'action': action,
            'resource': resource,
            'result': result,
            'details': details or {},
            'compliance_tags': compliance_tags or []
        }
        
        audit_logger.info(message, extra=extra)
    
    def update_log_level(self, level: str, logger_name: Optional[str] = None):
        """Dynamically update log level."""
        try:
            log_level = getattr(logging, level.upper())
            
            if logger_name:
                logger = logging.getLogger(logger_name)
                logger.setLevel(log_level)
                logging.info(f"Updated log level for {logger_name} to {level}")
            else:
                logging.root.setLevel(log_level)
                logging.info(f"Updated root log level to {level}")
        
        except AttributeError:
            logging.error(f"Invalid log level: {level}")
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get logging metrics."""
        return self.metrics_handler.get_metrics()
    
    def reset_metrics(self):
        """Reset logging metrics."""
        self.metrics_handler.reset_metrics()
    
    def flush_all_handlers(self):
        """Flush all logging handlers."""
        for handler in logging.root.handlers:
            if hasattr(handler, 'flush'):
                handler.flush()
    
    def close_all_handlers(self):
        """Close all logging handlers."""
        for handler_name, handler in self.handlers.items():
            try:
                handler.close()
                logging.info(f"Closed {handler_name} handler")
            except Exception as e:
                print(f"Error closing {handler_name} handler: {e}", file=sys.stderr)
        
        if self.audit_handler:
            try:
                self.audit_handler.close()
            except Exception as e:
                print(f"Error closing audit handler: {e}", file=sys.stderr)
    
    def archive_old_logs(self, days_to_keep: int = 30):
        """Archive old log files."""
        import shutil
        from datetime import timedelta
        
        try:
            cutoff_date = datetime.now() - timedelta(days=days_to_keep)
            logs_dir = Path('logs')
            archive_dir = Path('logs/archive')
            
            for log_file in logs_dir.glob('*.log*'):
                if log_file.stat().st_mtime < cutoff_date.timestamp():
                    archive_path = archive_dir / log_file.name
                    shutil.move(str(log_file), str(archive_path))
                    logging.info(f"Archived old log file: {log_file.name}")
        
        except Exception as e:
            logging.error(f"Failed to archive old logs: {e}")

# Global logging configuration instance
_logging_config = None

def get_logging_config() -> EnterpriseLoggingConfig:
    """Get or create the global logging configuration."""
    global _logging_config
    if _logging_config is None:
        _logging_config = EnterpriseLoggingConfig()
        _logging_config.configure_logging()
    return _logging_config

def configure_enterprise_logging(force_reconfigure: bool = False):
    """Configure enterprise logging system."""
    config = get_logging_config()
    config.configure_logging(force_reconfigure)

def get_logger(name: str) -> logging.Logger:
    """Get a logger with enterprise configuration."""
    config = get_logging_config()
    return config.get_logger(name)

def get_audit_logger() -> logging.Logger:
    """Get the audit logger."""
    config = get_logging_config()
    return config.get_audit_logger()

def log_audit_event(
    event_type: str,
    message: str,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    action: Optional[str] = None,
    resource: Optional[str] = None,
    result: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    compliance_tags: Optional[List[str]] = None
):
    """Log an audit event."""
    config = get_logging_config()
    config.log_audit_event(
        event_type, message, user_id, session_id, ip_address,
        action, resource, result, details, compliance_tags
    )

# Initialize logging configuration
configure_enterprise_logging()