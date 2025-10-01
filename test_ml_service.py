#!/usr/bin/env python3
import asyncio
import sys
import os

# Add the backend path
sys.path.append('data_wave/backend/scripts_automation')

from app.services.ml_service import EnterpriseMLService
from app.db_session import get_session

async def test_ml_service():
    try:
        print("Testing ML service...")
        async for session in get_session():
            ml_service = EnterpriseMLService()
            result = await ml_service.get_ml_model_configs(session)
            print(f"ML service test result: {len(result[0])} models found")
            return True
    except Exception as e:
        print(f"ML service test failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_ml_service())
    sys.exit(0 if success else 1)
