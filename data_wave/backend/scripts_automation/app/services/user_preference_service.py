"""
User Preference Service
======================

Enterprise user preference service for managing user preferences
and settings across the data governance system.

This service provides:
- User preference management
- Notification channel preferences
- UI customization preferences
- Data display preferences
- Security preferences
- Integration preferences
- Workflow preferences
- Accessibility preferences
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
import uuid

logger = logging.getLogger(__name__)


class UserPreferenceService:
    """Enterprise user preference service"""
    
    def __init__(self):
        self.user_preferences = {}  # User preferences cache
        self.default_preferences = self._load_default_preferences()
    
    def _load_default_preferences(self) -> Dict[str, Any]:
        """Load default user preferences"""
        return {
            "notifications": {
                "email_enabled": True,
                "push_enabled": True,
                "sms_enabled": False,
                "webhook_enabled": False,
                "notification_frequency": "immediate",
                "quiet_hours": {
                    "enabled": False,
                    "start_time": "22:00",
                    "end_time": "08:00"
                },
                "categories": {
                    "security_alerts": True,
                    "compliance_violations": True,
                    "data_quality_issues": True,
                    "system_maintenance": False,
                    "feature_updates": False
                }
            },
            "ui": {
                "theme": "light",
                "language": "en",
                "timezone": "UTC",
                "date_format": "YYYY-MM-DD",
                "time_format": "24h",
                "page_size": 25,
                "auto_refresh": True,
                "refresh_interval": 30
            },
            "data_display": {
                "show_technical_details": False,
                "show_sensitive_data": False,
                "data_format": "table",
                "sort_preference": "name",
                "filter_preference": "all",
                "export_format": "csv"
            },
            "security": {
                "session_timeout": 3600,
                "require_mfa": False,
                "password_expiry_days": 90,
                "failed_login_attempts": 5,
                "lockout_duration": 900
            },
            "integrations": {
                "api_access": True,
                "webhook_endpoints": [],
                "third_party_integrations": [],
                "data_sharing": False
            },
            "workflow": {
                "auto_approval": False,
                "approval_threshold": "manager",
                "escalation_enabled": True,
                "escalation_time": 24,
                "workflow_notifications": True
            },
            "accessibility": {
                "high_contrast": False,
                "font_size": "medium",
                "screen_reader": False,
                "keyboard_navigation": True,
                "reduced_motion": False
            }
        }
    
    async def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user preferences"""
        try:
            # Check cache first
            if user_id in self.user_preferences:
                return {
                    "success": True,
                    "user_id": user_id,
                    "preferences": self.user_preferences[user_id],
                    "last_updated": datetime.utcnow().isoformat()
                }
            
            # In a real implementation, this would fetch from database
            # For now, return default preferences
            user_prefs = self.default_preferences.copy()
            
            # Cache the preferences
            self.user_preferences[user_id] = user_prefs
            
            logger.info(f"Retrieved preferences for user: {user_id}")
            return {
                "success": True,
                "user_id": user_id,
                "preferences": user_prefs,
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting user preferences for {user_id}: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_user_preferences(
        self,
        user_id: str,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update user preferences"""
        try:
            # Get current preferences
            current_prefs = await self.get_user_preferences(user_id)
            if not current_prefs["success"]:
                return current_prefs
            
            # Merge with new preferences
            updated_prefs = self._merge_preferences(
                current_prefs["preferences"],
                preferences
            )
            
            # Validate preferences
            validation_result = self._validate_preferences(updated_prefs)
            if not validation_result["valid"]:
                return {
                    "success": False,
                    "error": f"Invalid preferences: {validation_result['errors']}"
                }
            
            # Update cache
            self.user_preferences[user_id] = updated_prefs
            
            # In a real implementation, this would save to database
            logger.info(f"Updated preferences for user: {user_id}")
            return {
                "success": True,
                "user_id": user_id,
                "preferences": updated_prefs,
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error updating user preferences for {user_id}: {e}")
            return {"success": False, "error": str(e)}
    
    def _merge_preferences(
        self,
        current_prefs: Dict[str, Any],
        new_prefs: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Merge current and new preferences"""
        try:
            merged = current_prefs.copy()
            
            for category, settings in new_prefs.items():
                if category in merged:
                    if isinstance(settings, dict):
                        merged[category].update(settings)
                    else:
                        merged[category] = settings
                else:
                    merged[category] = settings
            
            return merged
            
        except Exception as e:
            logger.error(f"Error merging preferences: {e}")
            return current_prefs
    
    def _validate_preferences(self, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Validate user preferences"""
        try:
            errors = []
            
            # Validate notification preferences
            if "notifications" in preferences:
                notif_prefs = preferences["notifications"]
                
                if "notification_frequency" in notif_prefs:
                    valid_frequencies = ["immediate", "hourly", "daily", "weekly"]
                    if notif_prefs["notification_frequency"] not in valid_frequencies:
                        errors.append("Invalid notification frequency")
                
                if "quiet_hours" in notif_prefs:
                    quiet_hours = notif_prefs["quiet_hours"]
                    if quiet_hours.get("enabled", False):
                        # Validate time format
                        try:
                            datetime.strptime(quiet_hours.get("start_time", ""), "%H:%M")
                            datetime.strptime(quiet_hours.get("end_time", ""), "%H:%M")
                        except ValueError:
                            errors.append("Invalid quiet hours time format")
            
            # Validate UI preferences
            if "ui" in preferences:
                ui_prefs = preferences["ui"]
                
                if "theme" in ui_prefs:
                    valid_themes = ["light", "dark", "auto"]
                    if ui_prefs["theme"] not in valid_themes:
                        errors.append("Invalid theme")
                
                if "language" in ui_prefs:
                    valid_languages = ["en", "es", "fr", "de", "zh", "ja"]
                    if ui_prefs["language"] not in valid_languages:
                        errors.append("Invalid language")
                
                if "page_size" in ui_prefs:
                    page_size = ui_prefs["page_size"]
                    if not isinstance(page_size, int) or page_size < 1 or page_size > 1000:
                        errors.append("Invalid page size")
            
            # Validate security preferences
            if "security" in preferences:
                security_prefs = preferences["security"]
                
                if "session_timeout" in security_prefs:
                    timeout = security_prefs["session_timeout"]
                    if not isinstance(timeout, int) or timeout < 300 or timeout > 86400:
                        errors.append("Invalid session timeout")
                
                if "password_expiry_days" in security_prefs:
                    expiry_days = security_prefs["password_expiry_days"]
                    if not isinstance(expiry_days, int) or expiry_days < 1 or expiry_days > 365:
                        errors.append("Invalid password expiry days")
            
            return {
                "valid": len(errors) == 0,
                "errors": errors
            }
            
        except Exception as e:
            logger.error(f"Error validating preferences: {e}")
            return {"valid": False, "errors": [str(e)]}
    
    async def get_notification_channels(self, user_id: str) -> Dict[str, Any]:
        """Get user notification channel preferences"""
        try:
            prefs_result = await self.get_user_preferences(user_id)
            if not prefs_result["success"]:
                return prefs_result
            
            notification_prefs = prefs_result["preferences"].get("notifications", {})
            
            channels = []
            
            if notification_prefs.get("email_enabled", False):
                channels.append("email")
            if notification_prefs.get("push_enabled", False):
                channels.append("push")
            if notification_prefs.get("sms_enabled", False):
                channels.append("sms")
            if notification_prefs.get("webhook_enabled", False):
                channels.append("webhook")
            
            return {
                "success": True,
                "user_id": user_id,
                "channels": channels,
                "frequency": notification_prefs.get("notification_frequency", "immediate"),
                "quiet_hours": notification_prefs.get("quiet_hours", {}),
                "categories": notification_prefs.get("categories", {})
            }
            
        except Exception as e:
            logger.error(f"Error getting notification channels for {user_id}: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_notification_channels(
        self,
        user_id: str,
        channels: List[str],
        frequency: str = "immediate",
        quiet_hours: Dict[str, Any] = None,
        categories: Dict[str, bool] = None
    ) -> Dict[str, Any]:
        """Update user notification channel preferences"""
        try:
            # Validate channels
            valid_channels = ["email", "push", "sms", "webhook"]
            for channel in channels:
                if channel not in valid_channels:
                    return {
                        "success": False,
                        "error": f"Invalid notification channel: {channel}"
                    }
            
            # Validate frequency
            valid_frequencies = ["immediate", "hourly", "daily", "weekly"]
            if frequency not in valid_frequencies:
                return {
                    "success": False,
                    "error": f"Invalid notification frequency: {frequency}"
                }
            
            # Build notification preferences
            notification_prefs = {
                "email_enabled": "email" in channels,
                "push_enabled": "push" in channels,
                "sms_enabled": "sms" in channels,
                "webhook_enabled": "webhook" in channels,
                "notification_frequency": frequency
            }
            
            if quiet_hours:
                notification_prefs["quiet_hours"] = quiet_hours
            
            if categories:
                notification_prefs["categories"] = categories
            
            # Update preferences
            return await self.update_user_preferences(
                user_id,
                {"notifications": notification_prefs}
            )
            
        except Exception as e:
            logger.error(f"Error updating notification channels for {user_id}: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_ui_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user UI preferences"""
        try:
            prefs_result = await self.get_user_preferences(user_id)
            if not prefs_result["success"]:
                return prefs_result
            
            ui_prefs = prefs_result["preferences"].get("ui", {})
            
            return {
                "success": True,
                "user_id": user_id,
                "ui_preferences": ui_prefs
            }
            
        except Exception as e:
            logger.error(f"Error getting UI preferences for {user_id}: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_ui_preferences(
        self,
        user_id: str,
        ui_preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update user UI preferences"""
        try:
            return await self.update_user_preferences(
                user_id,
                {"ui": ui_preferences}
            )
            
        except Exception as e:
            logger.error(f"Error updating UI preferences for {user_id}: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_security_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user security preferences"""
        try:
            prefs_result = await self.get_user_preferences(user_id)
            if not prefs_result["success"]:
                return prefs_result
            
            security_prefs = prefs_result["preferences"].get("security", {})
            
            return {
                "success": True,
                "user_id": user_id,
                "security_preferences": security_prefs
            }
            
        except Exception as e:
            logger.error(f"Error getting security preferences for {user_id}: {e}")
            return {"success": False, "error": str(e)}
    
    async def update_security_preferences(
        self,
        user_id: str,
        security_preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update user security preferences"""
        try:
            return await self.update_user_preferences(
                user_id,
                {"security": security_preferences}
            )
            
        except Exception as e:
            logger.error(f"Error updating security preferences for {user_id}: {e}")
            return {"success": False, "error": str(e)}
    
    async def reset_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Reset user preferences to defaults"""
        try:
            # Remove from cache
            if user_id in self.user_preferences:
                del self.user_preferences[user_id]
            
            # Return default preferences
            default_prefs = self.default_preferences.copy()
            
            logger.info(f"Reset preferences for user: {user_id}")
            return {
                "success": True,
                "user_id": user_id,
                "preferences": default_prefs,
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error resetting preferences for {user_id}: {e}")
            return {"success": False, "error": str(e)}
    
    async def export_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Export user preferences"""
        try:
            prefs_result = await self.get_user_preferences(user_id)
            if not prefs_result["success"]:
                return prefs_result
            
            export_data = {
                "user_id": user_id,
                "exported_at": datetime.utcnow().isoformat(),
                "preferences": prefs_result["preferences"],
                "version": "1.0"
            }
            
            return {
                "success": True,
                "export_data": export_data,
                "format": "json"
            }
            
        except Exception as e:
            logger.error(f"Error exporting preferences for {user_id}: {e}")
            return {"success": False, "error": str(e)}
    
    async def import_user_preferences(
        self,
        user_id: str,
        import_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Import user preferences"""
        try:
            # Validate import data
            if "preferences" not in import_data:
                return {
                    "success": False,
                    "error": "Invalid import data: missing preferences"
                }
            
            # Validate preferences
            validation_result = self._validate_preferences(import_data["preferences"])
            if not validation_result["valid"]:
                return {
                    "success": False,
                    "error": f"Invalid preferences in import data: {validation_result['errors']}"
                }
            
            # Update preferences
            return await self.update_user_preferences(
                user_id,
                import_data["preferences"]
            )
            
        except Exception as e:
            logger.error(f"Error importing preferences for {user_id}: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_preference_statistics(self) -> Dict[str, Any]:
        """Get preference statistics across all users"""
        try:
            # Aggregate statistics from database and cache
            from .data_source_service import DataSourceService
            ds_service = DataSourceService()
            
            db_stats = await ds_service.get_user_preference_statistics()
            if not db_stats.get("success"):
                # Fallback to cached statistics
                stats = {
                    "total_users": len(self.user_preferences),
                    "preferences_by_category": {
                        "notifications": 0,
                        "ui": 0,
                        "security": 0,
                        "data_display": 0,
                        "integrations": 0,
                        "workflow": 0,
                        "accessibility": 0
                    },
                    "popular_themes": {
                        "light": 0,
                        "dark": 0,
                        "auto": 0
                    },
                    "notification_channels": {
                        "email": 0,
                        "push": 0,
                        "sms": 0,
                        "webhook": 0
                    }
                }
            else:
                stats = db_stats.get("statistics", {})
            
            # Calculate statistics from cached preferences
            for user_id, prefs in self.user_preferences.items():
                for category in stats["preferences_by_category"]:
                    if category in prefs:
                        stats["preferences_by_category"][category] += 1
                
                # Theme statistics
                ui_prefs = prefs.get("ui", {})
                theme = ui_prefs.get("theme", "light")
                if theme in stats["popular_themes"]:
                    stats["popular_themes"][theme] += 1
                
                # Notification channel statistics
                notif_prefs = prefs.get("notifications", {})
                for channel in stats["notification_channels"]:
                    if notif_prefs.get(f"{channel}_enabled", False):
                        stats["notification_channels"][channel] += 1
            
            return {
                "success": True,
                "statistics": stats,
                "generated_at": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting preference statistics: {e}")
            return {"success": False, "error": str(e)}
