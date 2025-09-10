import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.db_session import get_session
from app.models.scan_models import (
    DataSource, DataSourceType, DataSourceLocation,
    ScanRuleSet, Scan, ScanStatus, ScanResult, ScanSchedule
)


# Create in-memory SQLite database for testing
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


# Create test client
@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


# Test data source creation
def test_create_data_source(client: TestClient):
    response = client.post(
        "/scan/data-sources",
        json={
            "name": "Test MySQL",
            "source_type": "mysql",
            "location": "on-prem",
            "host": "localhost",
            "port": 3306,
            "username": "root",
            "password": "root",
            "database_name": "testdb",
            "description": "Test MySQL database"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test MySQL"
    assert data["source_type"] == "mysql"
    assert data["host"] == "localhost"
    assert "id" in data


# Test get all data sources
def test_get_data_sources(client: TestClient, session: Session):
    # Create test data source
    data_source = DataSource(
        name="Test PostgreSQL",
        source_type=DataSourceType.POSTGRESQL,
        location=DataSourceLocation.ON_PREM,
        host="localhost",
        port=5432,
        username="postgres",
        password_secret="postgres",
        database_name="testdb"
    )
    session.add(data_source)
    session.commit()
    
    response = client.get("/scan/data-sources")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test PostgreSQL"


# Test scan rule set creation
def test_create_scan_rule_set(client: TestClient, session: Session):
    # Create test data source
    data_source = DataSource(
        name="Test MongoDB",
        source_type=DataSourceType.MONGODB,
        location=DataSourceLocation.ON_PREM,
        host="localhost",
        port=27017,
        username="admin",
        password_secret="admin"
    )
    session.add(data_source)
    session.commit()
    
    response = client.post(
        "/scan/rule-sets",
        json={
            "name": "Test Rule Set",
            "data_source_id": data_source.id,
            "description": "Test rule set",
            "include_schemas": ["testdb"],
            "exclude_tables": ["log_*"],
            "sample_data": False
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Rule Set"
    assert data["data_source_id"] == data_source.id
    assert data["include_schemas"] == ["testdb"]


# Test scan creation
def test_create_scan(client: TestClient, session: Session):
    # Create test data source
    data_source = DataSource(
        name="Test MySQL",
        source_type=DataSourceType.MYSQL,
        location=DataSourceLocation.ON_PREM,
        host="localhost",
        port=3306,
        username="root",
        password_secret="root",
        database_name="testdb"
    )
    session.add(data_source)
    
    # Create test scan rule set
    rule_set = ScanRuleSet(
        name="Test Rule Set",
        data_source_id=1,
        include_schemas=["testdb"],
        exclude_tables=["log_*"],
        sample_data=False
    )
    session.add(rule_set)
    session.commit()
    
    response = client.post(
        "/scan/scans",
        json={
            "name": "Test Scan",
            "data_source_id": data_source.id,
            "scan_rule_set_id": rule_set.id,
            "description": "Test scan"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Scan"
    assert data["data_source_id"] == data_source.id
    assert data["scan_rule_set_id"] == rule_set.id
    assert data["status"] == "pending"


# Test scan schedule creation
def test_create_scan_schedule(client: TestClient, session: Session):
    # Create test data source
    data_source = DataSource(
        name="Test PostgreSQL",
        source_type=DataSourceType.POSTGRESQL,
        location=DataSourceLocation.ON_PREM,
        host="localhost",
        port=5432,
        username="postgres",
        password_secret="postgres",
        database_name="testdb"
    )
    session.add(data_source)
    
    # Create test scan rule set
    rule_set = ScanRuleSet(
        name="Test Rule Set",
        data_source_id=1,
        include_schemas=["testdb"],
        exclude_tables=["log_*"],
        sample_data=False
    )
    session.add(rule_set)
    session.commit()
    
    response = client.post(
        "/scan/schedules",
        json={
            "name": "Test Schedule",
            "data_source_id": data_source.id,
            "scan_rule_set_id": rule_set.id,
            "cron_expression": "0 0 * * *",
            "description": "Test schedule",
            "enabled": True
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Schedule"
    assert data["data_source_id"] == data_source.id
    assert data["scan_rule_set_id"] == rule_set.id
    assert data["cron_expression"] == "0 0 * * *"
    assert data["enabled"] == True