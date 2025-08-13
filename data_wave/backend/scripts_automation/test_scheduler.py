#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.abspath('.'))

print("Testing scheduler-specific imports...")

try:
    from apscheduler.schedulers.background import BackgroundScheduler
    print("✅ APScheduler import successful")
except Exception as e:
    print(f"❌ APScheduler import failed: {e}")

try:
    from app.services.extraction_service import extract_sql_schema
    print("✅ Extraction service import successful")
except Exception as e:
    print(f"❌ Extraction service import failed: {e}")

try:
    from app.api.classifiers.regex_classifier import RegexClassifier
    print("✅ Regex classifier import successful")
except Exception as e:
    print(f"❌ Regex classifier import failed: {e}")

try:
    from app.api.classifiers.dictionary_classifier import DictionaryClassifier
    print("✅ Dictionary classifier import successful")
except Exception as e:
    print(f"❌ Dictionary classifier import failed: {e}")

try:
    from app.api.classifiers.hybrid_classifier import HybridClassifier
    print("✅ Hybrid classifier import successful")
except Exception as e:
    print(f"❌ Hybrid classifier import failed: {e}")

try:
    from app.services.data_sensitivity_service import assign_data_sensitivity_label
    print("✅ Data sensitivity service import successful")
except Exception as e:
    print(f"❌ Data sensitivity service import failed: {e}")

print("Scheduler import testing completed.")