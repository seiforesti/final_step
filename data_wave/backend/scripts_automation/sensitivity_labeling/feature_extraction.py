"""
feature_extraction.py
Utility for extracting ML features from object metadata, schema, and history.
"""
from typing import Dict, Any, List
import numpy as np

def extract_features_from_metadata(metadata: Dict[str, Any]) -> np.ndarray:
    """
    Advanced feature extraction from object metadata for ML suggestions.
    Features:
    - One-hot for type (string, int, float, bool, date)
    - Name length
    - Has numbers in name
    - Unique value count (normalized)
    - Null ratio
    - Mean, std (if numeric)
    - User action counts (proposals, reviews)
    """
    features = []
    # One-hot encoding for type
    col_type = metadata.get("type", "").lower()
    for t in ["string", "int", "float", "bool", "date"]:
        features.append(1 if col_type == t else 0)
    # Name length
    features.append(len(metadata.get("name", "")))
    # Has numbers in name
    features.append(1 if any(char.isdigit() for char in metadata.get("name", "")) else 0)
    # Unique value count (normalized)
    unique_count = metadata.get("unique_count")
    total_count = metadata.get("total_count", 1)
    features.append(float(unique_count) / total_count if unique_count is not None and total_count else 0.0)
    # Null ratio
    null_count = metadata.get("null_count")
    features.append(float(null_count) / total_count if null_count is not None and total_count else 0.0)
    # Mean and std (if numeric)
    features.append(float(metadata.get("mean", 0.0)))
    features.append(float(metadata.get("std", 0.0)))
    # User action counts (proposals, reviews)
    features.append(float(metadata.get("proposal_count", 0)))
    features.append(float(metadata.get("review_count", 0)))
    return np.array(features)

# Example for batch extraction

def extract_features_batch(metadata_list: List[Dict[str, Any]]) -> np.ndarray:
    return np.array([extract_features_from_metadata(m) for m in metadata_list])
