"""
Enterprise-level DiffService for comprehensive change detection and analysis
Provides advanced structural, semantic, and impact analysis for content changes
"""

import logging
import json
import hashlib
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import difflib
from dataclasses import dataclass
import asyncio

logger = logging.getLogger(__name__)


@dataclass
class ChangeMetadata:
    """Metadata for detected changes"""
    change_id: str
    timestamp: datetime
    change_type: str
    severity: str
    confidence: float
    impact_level: str
    affected_components: List[str]
    description: str
    old_value: Any
    new_value: Any
    metadata: Dict[str, Any]


class DiffService:
    """
    Enterprise-level service for detecting and analyzing changes between content versions
    Provides comprehensive structural, semantic, and impact analysis
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    async def detect_structural_changes(
        self,
        old_content: Dict[str, Any],
        new_content: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Detect structural changes between content versions
        """
        try:
            changes = []
            
            # 1. Detect field additions/removals
            old_keys = set(old_content.keys())
            new_keys = set(new_content.keys())
            
            added_fields = new_keys - old_keys
            removed_fields = old_keys - old_keys
            common_fields = old_keys & new_keys
            
            # 2. Analyze field changes
            for field in added_fields:
                changes.append({
                    "type": "field_added",
                    "field": field,
                    "severity": "low",
                    "confidence": 1.0,
                    "impact_level": "minor",
                    "description": f"New field '{field}' added",
                    "old_value": None,
                    "new_value": new_content[field]
                })
            
            for field in removed_fields:
                changes.append({
                    "type": "field_removed",
                    "field": field,
                    "severity": "medium",
                    "confidence": 1.0,
                    "impact_level": "moderate",
                    "description": f"Field '{field}' removed",
                    "old_value": old_content[field],
                    "new_value": None
                })
            
            # 3. Analyze value changes in common fields
            for field in common_fields:
                old_val = old_content[field]
                new_val = new_content[field]
                
                if old_val != new_val:
                    change_type, severity, impact = self._analyze_value_change(
                        field, old_val, new_val
                    )
                    
                    changes.append({
                        "type": change_type,
                        "field": field,
                        "severity": severity,
                        "confidence": 0.9,
                        "impact_level": impact,
                        "description": f"Field '{field}' value changed",
                        "old_value": old_val,
                        "new_value": new_val
                    })
            
            # 4. Detect nested structure changes
            nested_changes = await self._detect_nested_changes(old_content, new_content)
            changes.extend(nested_changes)
            
            # 5. Add metadata to all changes
            for change in changes:
                change['timestamp'] = datetime.now().isoformat()
                change['change_id'] = self._generate_change_id(change)
                change['affected_components'] = [change.get('field', 'unknown')]
            
            return changes
            
        except Exception as e:
            self.logger.error(f"Error detecting structural changes: {e}")
            return []
    
    async def detect_nested_changes(
        self,
        old_content: Dict[str, Any],
        new_content: Dict[str, Any],
        path: str = ""
    ) -> List[Dict[str, Any]]:
        """
        Recursively detect changes in nested structures
        """
        changes = []
        
        try:
            for key in set(old_content.keys()) | set(new_content.keys()):
                current_path = f"{path}.{key}" if path else key
                
                if key not in old_content:
                    # New nested field
                    changes.append({
                        "type": "nested_field_added",
                        "field": current_path,
                        "severity": "low",
                        "confidence": 1.0,
                        "impact_level": "minor",
                        "description": f"New nested field '{current_path}' added",
                        "old_value": None,
                        "new_value": new_content[key]
                    })
                elif key not in new_content:
                    # Removed nested field
                    changes.append({
                        "type": "nested_field_removed",
                        "field": current_path,
                        "severity": "medium",
                        "confidence": 1.0,
                        "impact_level": "moderate",
                        "description": f"Nested field '{current_path}' removed",
                        "old_value": old_content[key],
                        "new_value": None
                    })
                else:
                    # Both exist, check for changes
                    old_val = old_content[key]
                    new_val = new_content[key]
                    
                    if isinstance(old_val, dict) and isinstance(new_val, dict):
                        # Recursively check nested dictionaries
                        nested_changes = await self.detect_nested_changes(
                            old_val, new_val, current_path
                        )
                        changes.extend(nested_changes)
                    elif isinstance(old_val, list) and isinstance(new_val, list):
                        # Check list changes
                        list_changes = self._detect_list_changes(
                            current_path, old_val, new_val
                        )
                        changes.extend(list_changes)
                    elif old_val != new_val:
                        # Enterprise value change analysis with type-aware impact
                        change_type, severity, impact = self._analyze_value_change(
                            current_path, old_val, new_val
                        )
                        
                        changes.append({
                            "type": change_type,
                            "field": current_path,
                            "severity": severity,
                            "confidence": 0.9,
                            "impact_level": impact,
                            "description": f"Nested field '{current_path}' value changed",
                            "old_value": old_val,
                            "new_value": new_val
                        })
            
            return changes
            
        except Exception as e:
            self.logger.error(f"Error detecting nested changes: {e}")
            return []
    
    def _detect_list_changes(
        self,
        path: str,
        old_list: List[Any],
        new_list: List[Any]
    ) -> List[Dict[str, Any]]:
        """
        Detect changes in list structures
        """
        changes = []
        
        try:
            # Detect length changes
            if len(old_list) != len(new_list):
                changes.append({
                    "type": "list_length_changed",
                    "field": path,
                    "severity": "medium",
                    "confidence": 1.0,
                    "impact_level": "moderate",
                    "description": f"List '{path}' length changed from {len(old_list)} to {len(new_list)}",
                    "old_value": len(old_list),
                    "new_value": len(old_list)
                })
            
            # Detect content changes (diff-based)
            if len(old_list) > 0 or len(new_list) > 0:
                import difflib
                old_repr = [json.dumps(x, sort_keys=True) for x in old_list]
                new_repr = [json.dumps(x, sort_keys=True) for x in new_list]
                diff = list(difflib.unified_diff(old_repr, new_repr, lineterm=""))
                if diff:
                    changes.append({
                        "type": "list_content_changed",
                        "field": path,
                        "severity": "medium",
                        "confidence": 0.85,
                        "impact_level": "moderate",
                        "description": f"List '{path}' content modified",
                        "old_value": old_list[:3],
                        "new_value": new_list[:3]
                    })
            
            return changes
            
        except Exception as e:
            self.logger.error(f"Error detecting list changes: {e}")
            return []
    
    def _analyze_value_change(
        self,
        field: str,
        old_value: Any,
        new_value: Any
    ) -> Tuple[str, str, str]:
        """
        Analyze the type and impact of a value change
        """
        try:
            # Determine change type
            if isinstance(old_value, (int, float)) and isinstance(new_value, (int, float)):
                change_type = "numeric_value_changed"
                # Calculate percentage change for numeric values
                if old_value != 0:
                    change_percent = abs((new_value - old_value) / old_value) * 100
                    if change_percent > 50:
                        severity = "high"
                        impact = "significant"
                    elif change_percent > 20:
                        severity = "medium"
                        impact = "moderate"
                    else:
                        severity = "low"
                        impact = "minor"
                else:
                    severity = "medium"
                    impact = "moderate"
            elif isinstance(old_value, str) and isinstance(new_value, str):
                change_type = "string_value_changed"
                # Analyze string similarity
                similarity = difflib.SequenceMatcher(None, old_value, new_value).ratio()
                if similarity < 0.5:
                    severity = "high"
                    impact = "significant"
                elif similarity < 0.8:
                    severity = "medium"
                    impact = "moderate"
                else:
                    severity = "low"
                    impact = "minor"
            elif isinstance(old_value, bool) and isinstance(new_value, bool):
                change_type = "boolean_value_changed"
                severity = "medium"
                impact = "moderate"
            else:
                change_type = "type_changed"
                severity = "high"
                impact = "significant"
            
            return change_type, severity, impact
            
        except Exception as e:
            self.logger.error(f"Error analyzing value change: {e}")
            return "unknown_change", "medium", "moderate"
    
    def _generate_change_id(self, change: Dict[str, Any]) -> str:
        """
        Generate a unique identifier for a change
        """
        try:
            change_str = f"{change['type']}_{change['field']}_{change['timestamp']}"
            return hashlib.md5(change_str.encode()).hexdigest()[:8]
        except Exception:
            return hashlib.md5(str(change).encode()).hexdigest()[:8]
    
    async def get_change_summary(
        self,
        changes: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate a summary of detected changes
        """
        try:
            if not changes:
                return {
                    "total_changes": 0,
                    "change_types": {},
                    "severity_distribution": {},
                    "impact_summary": "no_changes"
                }
            
            # Count change types
            change_types = {}
            severity_distribution = {}
            impact_levels = {}
            
            for change in changes:
                # Count change types
                change_type = change.get('type', 'unknown')
                change_types[change_type] = change_types.get(change_type, 0) + 1
                
                # Count severity levels
                severity = change.get('severity', 'unknown')
                severity_distribution[severity] = severity_distribution.get(severity, 0) + 1
                
                # Count impact levels
                impact = change.get('impact_level', 'unknown')
                impact_levels[impact] = impact_levels.get(impact, 0) + 1
            
            # Determine overall impact
            if impact_levels.get('significant', 0) > 0:
                overall_impact = "significant"
            elif impact_levels.get('moderate', 0) > 0:
                overall_impact = "moderate"
            else:
                overall_impact = "minor"
            
            return {
                "total_changes": len(changes),
                "change_types": change_types,
                "severity_distribution": severity_distribution,
                "impact_distribution": impact_levels,
                "overall_impact": overall_impact,
                "critical_changes": len([c for c in changes if c.get('severity') == 'critical']),
                "high_priority_changes": len([c for c in changes if c.get('severity') in ['critical', 'high']])
            }
            
        except Exception as e:
            self.logger.error(f"Error generating change summary: {e}")
            return {
                "total_changes": 0,
                "error": str(e)
            }
