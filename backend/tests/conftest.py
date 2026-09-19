import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app as fastapi_app
from app.database import Base, get_db
import app.models  # noqa: F401

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_navora.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    from app.seed import seed_demo_data
    try:
        seed_demo_data(db)
    except Exception:
        pass
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app) as test_client:
        yield test_client
    fastapi_app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client, db_session):
    client.post("/api/auth/register", json={
        "full_name": "Test Traveler",
        "email": "traveler_test@navora.ai",
        "password": "Password123!"
    })
    resp = client.post("/api/auth/login", json={
        "identifier": "traveler_test@navora.ai",
        "password": "Password123!"
    })
    token = resp.json().get("access_token", "")
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_user(db_session, auth_headers):
    from app.models.auth import User
    user = db_session.query(User).filter(User.email == "traveler_test@navora.ai").first()
    return user
