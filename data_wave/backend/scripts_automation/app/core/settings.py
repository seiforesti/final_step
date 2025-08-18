"""
Enterprise Settings Management

Runtime configuration management and settings updates for the
Enterprise Data Governance Platform with dynamic configuration
capabilities and environment-specific overrides.
"""

import json
import os
from typing import Dict, Any, Optional, List, Union
from dataclasses import dataclass, field
from datetime import datetime
import threading
import logging
from pathlib import Path

from .config import settings as global_settings

logger = logging.getLogger(__name__)

@dataclass
class SettingsUpdate:
    """Represents a settings update operation."""
    key: str
    value: Any
    timestamp: datetime = field(default_factory=datetime.now)
    user: Optional[str] = None
    reason: Optional[str] = None

class SettingsManager:
    """
    Dynamic settings manager for runtime configuration updates.
    
    Features:
    - Runtime configuration updates
    - Settings validation and rollback
    - Configuration history and auditing
    - Environment-specific overrides
    - Hot-reload capabilities
    - Settings synchronization across instances
    """
    
    def __init__(
        self,
        config_file: Optional[str] = None,
        enable_persistence: bool = True,
        enable_hot_reload: bool = True
    ):
        self.config_file = config_file or "runtime_settings.json"
        self.enable_persistence = enable_persistence
        self.enable_hot_reload = enable_hot_reload
        
        # Runtime settings storage
        self._runtime_settings: Dict[str, Any] = {}
        self._settings_history: List[SettingsUpdate] = []
        self._lock = threading.RLock()
        
        # Override hierarchies
        self._environment_overrides: Dict[str, Dict[str, Any]] = {}
        self._feature_flags: Dict[str, bool] = {}
        self._performance_settings: Dict[str, Any] = {}
        
        # Validation callbacks
        self._validators: Dict[str, callable] = {}
        self._change_listeners: List[callable] = []
        
        # Initialize settings
        self._load_runtime_settings()
        self._setup_default_validators()
        
        if self.enable_hot_reload:
            self._start_file_watcher()
    
    def _load_runtime_settings(self):
        """Load runtime settings from file."""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    data = json.load(f)
                    
                with self._lock:
                    self._runtime_settings = data.get('settings', {})
                    self._environment_overrides = data.get('environment_overrides', {})
                    self._feature_flags = data.get('feature_flags', {})
                    self._performance_settings = data.get('performance_settings', {})
                    
                    # Load history
                    history_data = data.get('history', [])
                    self._settings_history = [
                        SettingsUpdate(
                            key=h['key'],
                            value=h['value'],
                            timestamp=datetime.fromisoformat(h['timestamp']),
                            user=h.get('user'),
                            reason=h.get('reason')
                        )
                        for h in history_data
                    ]
                
                logger.info(f"Loaded runtime settings from {self.config_file}")
        except Exception as e:
            logger.error(f"Failed to load runtime settings: {e}")
    
    def _save_runtime_settings(self):
        """Save runtime settings to file."""
        if not self.enable_persistence:
            return
        
        try:
            with self._lock:
                data = {
                    'settings': self._runtime_settings,
                    'environment_overrides': self._environment_overrides,
                    'feature_flags': self._feature_flags,
                    'performance_settings': self._performance_settings,
                    'history': [
                        {
                            'key': h.key,
                            'value': h.value,
                            'timestamp': h.timestamp.isoformat(),
                            'user': h.user,
                            'reason': h.reason
                        }
                        for h in self._settings_history[-100:]  # Keep last 100 changes
                    ],
                    'last_updated': datetime.now().isoformat()
                }
            
            # Create backup
            if os.path.exists(self.config_file):
                backup_file = f"{self.config_file}.backup"
                os.rename(self.config_file, backup_file)
            
            with open(self.config_file, 'w') as f:
                json.dump(data, f, indent=2, default=str)
            
            logger.debug(f"Saved runtime settings to {self.config_file}")
            
        except Exception as e:
            logger.error(f"Failed to save runtime settings: {e}")
    
    def _setup_default_validators(self):
        """Setup default validation functions."""
        
        def validate_positive_int(value):
            if not isinstance(value, int) or value <= 0:
                raise ValueError("Value must be a positive integer")
            return True
        
        def validate_boolean(value):
            if not isinstance(value, bool):
                raise ValueError("Value must be a boolean")
            return True
        
        def validate_string(value):
            if not isinstance(value, str):
                raise ValueError("Value must be a string")
            return True
        
        def validate_log_level(value):
            allowed = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
            if value not in allowed:
                raise ValueError(f"Log level must be one of {allowed}")
            return True
        
        def validate_environment(value):
            allowed = ['development', 'staging', 'production']
            if value not in allowed:
                raise ValueError(f"Environment must be one of {allowed}")
            return True
        
        # Register validators
        self._validators.update({
            'scan.max_scan_rows': validate_positive_int,
            'scan.concurrent_scans': validate_positive_int,
            'scan.scan_timeout_seconds': validate_positive_int,
            'database.pool_size': validate_positive_int,
            'cache.max_cache_size': validate_positive_int,
            'cache.default_ttl_seconds': validate_positive_int,
            'monitoring.log_level': validate_log_level,
            'enterprise.environment': validate_environment,
            'enterprise.debug': validate_boolean,
            'cache.enable_caching': validate_boolean,
            'classification.enable_classification': validate_boolean,
            'aiml.enable_ai_features': validate_boolean
        })
    
    def _start_file_watcher(self):
        """Start file watcher for hot-reload."""
        def watch_file():
            import time
            last_modified = 0
            
            while True:
                try:
                    if os.path.exists(self.config_file):
                        current_modified = os.path.getmtime(self.config_file)
                        if current_modified > last_modified:
                            last_modified = current_modified
                            self._load_runtime_settings()
                            self._notify_change_listeners()
                    
                    time.sleep(5)  # Check every 5 seconds
                except Exception as e:
                    logger.error(f"File watcher error: {e}")
                    time.sleep(30)
        
        watcher_thread = threading.Thread(target=watch_file, daemon=True)
        watcher_thread.start()
        logger.info("Started settings file watcher")
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get a setting value with hierarchy resolution.
        
        Priority order:
        1. Runtime settings
        2. Environment-specific overrides
        3. Global configuration
        4. Default value
        """
        with self._lock:
            # Check runtime settings first
            if key in self._runtime_settings:
                return self._runtime_settings[key]
            
            # Check environment overrides
            env = global_settings.enterprise.environment
            if env in self._environment_overrides:
                env_settings = self._environment_overrides[env]
                if key in env_settings:
                    return env_settings[key]
            
            # Check global configuration
            try:
                # Navigate nested settings using dot notation
                parts = key.split('.')
                value = global_settings
                for part in parts:
                    value = getattr(value, part)
                return value
            except (AttributeError, KeyError):
                pass
            
            return default
    
    def set(
        self,
        key: str,
        value: Any,
        user: Optional[str] = None,
        reason: Optional[str] = None,
        validate: bool = True,
        persist: bool = True
    ) -> bool:
        """
        Set a runtime setting value.
        
        Args:
            key: Setting key (supports dot notation)
            value: Setting value
            user: User making the change
            reason: Reason for the change
            validate: Whether to validate the value
            persist: Whether to persist to file
            
        Returns:
            True if successful
        """
        try:
            # Validate if requested
            if validate and key in self._validators:
                self._validators[key](value)
            
            with self._lock:
                # Store old value for rollback
                old_value = self._runtime_settings.get(key)
                
                # Set new value
                self._runtime_settings[key] = value
                
                # Record history
                update = SettingsUpdate(
                    key=key,
                    value=value,
                    user=user,
                    reason=reason
                )
                self._settings_history.append(update)
                
                # Notify listeners
                self._notify_change_listeners(key, old_value, value)
            
            # Persist if requested
            if persist:
                self._save_runtime_settings()
            
            logger.info(f"Updated setting '{key}' = {value} (user: {user})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to set setting '{key}': {e}")
            return False
    
    def delete(self, key: str, user: Optional[str] = None, reason: Optional[str] = None) -> bool:
        """Delete a runtime setting."""
        try:
            with self._lock:
                if key in self._runtime_settings:
                    old_value = self._runtime_settings.pop(key)
                    
                    # Record history
                    update = SettingsUpdate(
                        key=key,
                        value=None,
                        user=user,
                        reason=reason or "Deleted"
                    )
                    self._settings_history.append(update)
                    
                    # Notify listeners
                    self._notify_change_listeners(key, old_value, None)
                    
                    self._save_runtime_settings()
                    logger.info(f"Deleted setting '{key}' (user: {user})")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to delete setting '{key}': {e}")
            return False
    
    def set_feature_flag(self, flag: str, enabled: bool, user: Optional[str] = None) -> bool:
        """Set a feature flag."""
        try:
            with self._lock:
                old_value = self._feature_flags.get(flag)
                self._feature_flags[flag] = enabled
                
                # Record in history
                update = SettingsUpdate(
                    key=f"feature_flag.{flag}",
                    value=enabled,
                    user=user,
                    reason="Feature flag update"
                )
                self._settings_history.append(update)
                
                self._notify_change_listeners(f"feature_flag.{flag}", old_value, enabled)
            
            self._save_runtime_settings()
            logger.info(f"Set feature flag '{flag}' = {enabled} (user: {user})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to set feature flag '{flag}': {e}")
            return False
    
    def get_feature_flag(self, flag: str, default: bool = False) -> bool:
        """Get a feature flag value."""
        with self._lock:
            if flag in self._feature_flags:
                return self._feature_flags[flag]
            
            # Check global settings
            global_flags = global_settings.get_feature_flags()
            return global_flags.get(flag, default)
    
    def set_environment_override(self, environment: str, key: str, value: Any) -> bool:
        """Set an environment-specific override."""
        try:
            with self._lock:
                if environment not in self._environment_overrides:
                    self._environment_overrides[environment] = {}
                
                self._environment_overrides[environment][key] = value
            
            self._save_runtime_settings()
            logger.info(f"Set environment override for '{environment}': {key} = {value}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to set environment override: {e}")
            return False
    
    def add_validator(self, key: str, validator: callable):
        """Add a custom validator for a setting key."""
        self._validators[key] = validator
        logger.info(f"Added validator for setting '{key}'")
    
    def add_change_listener(self, listener: callable):
        """Add a change listener that gets called when settings change."""
        self._change_listeners.append(listener)
        logger.info("Added settings change listener")
    
    def _notify_change_listeners(self, key: str = None, old_value: Any = None, new_value: Any = None):
        """Notify all change listeners."""
        for listener in self._change_listeners:
            try:
                if key:
                    listener(key, old_value, new_value)
                else:
                    listener()
            except Exception as e:
                logger.error(f"Change listener error: {e}")
    
    def rollback_setting(self, key: str, user: Optional[str] = None) -> bool:
        """Rollback a setting to its previous value."""
        try:
            with self._lock:
                # Find the previous value for this key
                previous_updates = [
                    u for u in reversed(self._settings_history)
                    if u.key == key and u.value is not None
                ]
                
                if len(previous_updates) < 2:
                    logger.warning(f"Cannot rollback '{key}': insufficient history")
                    return False
                
                # Get the value before the last change
                previous_value = previous_updates[1].value
                
                # Set the previous value
                return self.set(
                    key,
                    previous_value,
                    user=user,
                    reason=f"Rollback to previous value",
                    persist=True
                )
            
        except Exception as e:
            logger.error(f"Failed to rollback setting '{key}': {e}")
            return False
    
    def get_settings_history(self, key: Optional[str] = None, limit: int = 50) -> List[SettingsUpdate]:
        """Get settings change history."""
        with self._lock:
            history = self._settings_history
            
            if key:
                history = [u for u in history if u.key == key]
            
            return list(reversed(history[-limit:]))
    
    def export_settings(self) -> Dict[str, Any]:
        """Export all current settings."""
        with self._lock:
            return {
                'runtime_settings': dict(self._runtime_settings),
                'environment_overrides': dict(self._environment_overrides),
                'feature_flags': dict(self._feature_flags),
                'performance_settings': dict(self._performance_settings),
                'exported_at': datetime.now().isoformat()
            }
    
    def import_settings(
        self,
        settings_data: Dict[str, Any],
        user: Optional[str] = None,
        validate: bool = True
    ) -> bool:
        """Import settings from a data dictionary."""
        try:
            imported_count = 0
            
            # Import runtime settings
            runtime_settings = settings_data.get('runtime_settings', {})
            for key, value in runtime_settings.items():
                if self.set(key, value, user=user, reason="Import", validate=validate, persist=False):
                    imported_count += 1
            
            # Import feature flags
            feature_flags = settings_data.get('feature_flags', {})
            for flag, enabled in feature_flags.items():
                if self.set_feature_flag(flag, enabled, user=user):
                    imported_count += 1
            
            # Import environment overrides
            env_overrides = settings_data.get('environment_overrides', {})
            with self._lock:
                self._environment_overrides.update(env_overrides)
            
            # Save all changes
            self._save_runtime_settings()
            
            logger.info(f"Imported {imported_count} settings (user: {user})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to import settings: {e}")
            return False
    
    def reset_to_defaults(self, user: Optional[str] = None) -> bool:
        """Reset all runtime settings to defaults."""
        try:
            with self._lock:
                old_settings = dict(self._runtime_settings)
                self._runtime_settings.clear()
                self._feature_flags.clear()
                self._environment_overrides.clear()
                
                # Record reset in history
                update = SettingsUpdate(
                    key="__reset__",
                    value="Reset to defaults",
                    user=user,
                    reason="Reset all settings to defaults"
                )
                self._settings_history.append(update)
                
                self._notify_change_listeners()
            
            self._save_runtime_settings()
            logger.info(f"Reset all settings to defaults (user: {user})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to reset settings: {e}")
            return False
    
    def get_effective_config(self) -> Dict[str, Any]:
        """Get the effective configuration after applying all overrides."""
        config = global_settings.to_dict()
        
        with self._lock:
            # Apply environment overrides
            env = global_settings.enterprise.environment
            if env in self._environment_overrides:
                self._deep_update(config, self._environment_overrides[env])
            
            # Apply runtime settings
            for key, value in self._runtime_settings.items():
                self._set_nested_value(config, key, value)
            
            # Add feature flags
            config['feature_flags'] = dict(self._feature_flags)
            
            # Add performance settings
            config['performance_settings'] = dict(self._performance_settings)
        
        return config
    
    def _deep_update(self, target: Dict, source: Dict):
        """Deep update dictionary."""
        for key, value in source.items():
            if key in target and isinstance(target[key], dict) and isinstance(value, dict):
                self._deep_update(target[key], value)
            else:
                target[key] = value
    
    def _set_nested_value(self, target: Dict, key: str, value: Any):
        """Set nested value using dot notation."""
        parts = key.split('.')
        current = target
        
        for part in parts[:-1]:
            if part not in current:
                current[part] = {}
            current = current[part]
        
        current[parts[-1]] = value
    
    def validate_all_settings(self) -> Dict[str, List[str]]:
        """Validate all current settings and return any errors."""
        errors = {}
        
        with self._lock:
            for key, value in self._runtime_settings.items():
                if key in self._validators:
                    try:
                        self._validators[key](value)
                    except Exception as e:
                        if key not in errors:
                            errors[key] = []
                        errors[key].append(str(e))
        
        return errors

# Global settings manager instance
_settings_manager = None

def get_settings_manager() -> SettingsManager:
    """Get or create the global settings manager."""
    global _settings_manager
    if _settings_manager is None:
        _settings_manager = SettingsManager()
    return _settings_manager

# Convenience functions
def get_setting(key: str, default: Any = None) -> Any:
    """Get a setting value."""
    manager = get_settings_manager()
    return manager.get(key, default)

def set_setting(key: str, value: Any, user: Optional[str] = None) -> bool:
    """Set a setting value."""
    manager = get_settings_manager()
    return manager.set(key, value, user=user)

def get_feature_flag(flag: str, default: bool = False) -> bool:
    """Get a feature flag value."""
    manager = get_settings_manager()
    return manager.get_feature_flag(flag, default)

def set_feature_flag(flag: str, enabled: bool, user: Optional[str] = None) -> bool:
    """Set a feature flag."""
    manager = get_settings_manager()
    return manager.set_feature_flag(flag, enabled, user)

# Export settings manager for direct access
settings_manager = get_settings_manager()