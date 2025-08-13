#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.abspath('.'))

print("Testing individual imports...")

try:
    from fastapi import FastAPI
    print("✅ FastAPI import successful")
except Exception as e:
    print(f"❌ FastAPI import failed: {e}")

try:
    from sqlmodel import SQLModel, Field
    print("✅ SQLModel import successful")
except Exception as e:
    print(f"❌ SQLModel import failed: {e}")

try:
    from app.core.cors import add_cors_middleware
    print("✅ Core CORS import successful")
except Exception as e:
    print(f"❌ Core CORS import failed: {e}")

try:
    from app.db_session import init_db
    print("✅ DB session import successful")
except Exception as e:
    print(f"❌ DB session import failed: {e}")

try:
    from app.services.scheduler import schedule_tasks
    print("✅ Scheduler import successful")
except Exception as e:
    print(f"❌ Scheduler import failed: {e}")

print("Import testing completed.")