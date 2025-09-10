"""
Data Sensitivity Classifier

This module provides logic to map classification names (e.g., "PII", "Financial") 
to data sensitivity labels (e.g., "Confidential", "Public") based on known standards 
from Microsoft Purview and Databricks.

The mapping ignores suffixes like "[Regex]" in classification names and uses 
priority ordering to assign the most restrictive label when multiple classifications exist.
"""

from typing import List, Optional

# Mapping of classification names (normalized) to data sensitivity labels
CLASSIFICATION_TO_SENSITIVITY = {
    "pii": "Confidential",
    "personal data": "Confidential",
    "financial": "Confidential",
    "secret": "Secret",
    "high confidential": "High Confidential",
    "confidential": "Confidential",
    "internal usage": "Internal Usage",
    "public": "Public",
    "sensitive": "Confidential",
    "restricted": "Secret",
    "regulated": "Confidential",
    # Add more mappings as needed
}

# Priority order for sensitivity labels (most restrictive first)
SENSITIVITY_PRIORITY = [
    "Secret",
    "High Confidential",
    "Confidential",
    "Internal Usage",
    "Public"
]

def normalize_classification_name(name: str) -> str:
    """
    Normalize classification name by stripping suffixes like [Regex], trimming, and lowercasing.
    """
    name = name.lower().strip()
    if "[" in name:
        name = name.split("[")[0].strip()
    return name

def classify_to_sensitivity(classifications: List[str]) -> Optional[str]:
    """
    Given a list of classification names, return the most restrictive data sensitivity label.
    """
    normalized = [normalize_classification_name(c) for c in classifications]
    matched_labels = set()

    for c in normalized:
        label = CLASSIFICATION_TO_SENSITIVITY.get(c)
        if label:
            matched_labels.add(label)

    if not matched_labels:
        return "Not Classified"

    # Return the highest priority label among matched labels
    for priority_label in SENSITIVITY_PRIORITY:
        if priority_label in matched_labels:
            return priority_label

    return "Not Classified"
