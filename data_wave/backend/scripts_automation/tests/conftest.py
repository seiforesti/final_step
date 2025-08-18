import os
os.environ["DB_URL"] = "sqlite:///./test.db"

from app.db_session import engine
from sensitivity_labeling.models import Notification, Base  # Explicit import to ensure table creation

import pytest
from fastapi.testclient import TestClient
from sensitivity_labeling.api import router as sensitivity_labeling_router
from sensitivity_labeling.notifications import router as notifications_router
from fastapi import FastAPI

@pytest.fixture(scope="session", autouse=True)
def create_test_tables():
    Base.metadata.create_all(engine)

@pytest.fixture(scope="session")
def app():
    app = FastAPI()
    app.include_router(sensitivity_labeling_router)
    app.include_router(notifications_router)
    return app

@pytest.fixture(scope="function")
def client(app):
    return TestClient(app)
