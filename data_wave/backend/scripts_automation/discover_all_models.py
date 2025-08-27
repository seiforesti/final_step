#!/usr/bin/env python3
"""
Model Discovery Script - Find ALL 327+ Models
===========================================

This script discovers and counts all SQLModel classes in your backend
to understand why only 147 tables were created instead of 327.
"""

import sys
import os
import importlib
import inspect
from typing import List, Dict, Set

# Add the app directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'app')))

from sqlmodel import SQLModel

def discover_all_model_files() -> List[str]:
    """Discover all Python model files in the app/models directory and subdirectories"""
    models_dir = os.path.join(os.path.dirname(__file__), 'app', 'models')
    model_files = []
    
    print(f"🔍 Discovering model files in: {models_dir}")
    
    for root, dirs, files in os.walk(models_dir):
        for file in files:
            if file.endswith('.py') and not file.startswith('__'):
                full_path = os.path.join(root, file)
                # Convert to module path
                rel_path = os.path.relpath(full_path, models_dir)
                module_path = rel_path.replace(os.sep, '.').replace('.py', '')
                model_files.append(module_path)
                print(f"📁 Found model file: {module_path}")
    
    print(f"✅ Discovered {len(model_files)} model files")
    return model_files

def count_all_models() -> Dict[str, int]:
    """Count all SQLModel classes in all model files"""
    model_files = discover_all_model_files()
    module_counts = {}
    total_models = 0
    
    print("\n🔍 Counting models in each file:")
    
    for module_path in model_files:
        try:
            # Import the module
            full_module_path = f"app.models.{module_path}"
            module = importlib.import_module(full_module_path)
            
            # Count SQLModel classes
            model_count = 0
            model_names = []
            
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                
                # Check if it's a SQLModel class with __tablename__
                if (inspect.isclass(attr) and 
                    hasattr(attr, '__tablename__') and 
                    hasattr(attr, '__name__') and
                    issubclass(attr, SQLModel)):
                    
                    model_count += 1
                    model_names.append(attr.__name__)
            
            if model_count > 0:
                module_counts[full_module_path] = {
                    'count': model_count,
                    'models': model_names
                }
                total_models += model_count
                print(f"   {full_module_path}: {model_count} models")
                for model_name in model_names:
                    print(f"     - {model_name}")
        
        except ImportError as e:
            print(f"⚠️ Failed to import {module_path}: {e}")
        except Exception as e:
            print(f"❌ Error processing {module_path}: {e}")
    
    print(f"\n📊 SUMMARY:")
    print(f"   Total model files: {len(model_files)}")
    print(f"   Total SQLModel classes: {total_models}")
    print(f"   Files with models: {len(module_counts)}")
    
    return module_counts

if __name__ == "__main__":
    print("🚀 Model Discovery Script")
    print("=" * 50)
    
    counts = count_all_models()
    
    print("\n🎯 EXPECTED: 327+ models")
    print("📊 ACTUAL: Found models")
    print("=" * 50)

