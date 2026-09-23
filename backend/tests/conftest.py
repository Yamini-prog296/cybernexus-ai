import pytest
from app.database import engine, Base


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Ensure all tables exist before tests run
    Base.metadata.create_all(bind=engine)
    yield
