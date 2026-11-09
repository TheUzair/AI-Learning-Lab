import pytest
from fastapi.testclient import TestClient
from ml_api.main import app

# Create a test client using the FastAPI app and lifespan context
@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_root_endpoint(client):
    """Test the welcome root endpoint returns navigation links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "docs_url" in data
    assert data["docs_url"] == "/docs"


def test_health_ready_endpoint(client):
    """Test readiness check reports model loaded."""
    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["model_version"] == "1.0.0"


def test_predict_success(client):
    """Test standard prediction request returns reasonable cost."""
    payload = {
        "age": 30,
        "sex": "female",
        "bmi": 24.5,
        "children": 0,
        "smoker": False,
        "region": "northwest",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_charges" in data
    assert data["predicted_charges"] > 0
    assert data["currency"] == "USD"


def test_smoker_premium_logic(client):
    """Verify that a smoker has substantially higher predicted charges."""
    base_payload = {
        "age": 35,
        "sex": "male",
        "bmi": 28.0,
        "children": 1,
        "region": "southeast",
    }
    
    non_smoker_res = client.post("/predict", json={**base_payload, "smoker": False})
    smoker_res = client.post("/predict", json={**base_payload, "smoker": True})

    assert non_smoker_res.status_code == 200
    assert smoker_res.status_code == 200

    non_smoker_charge = non_smoker_res.json()["predicted_charges"]
    smoker_charge = smoker_res.json()["predicted_charges"]

    # Smoker charges should exceed non-smoker by at least $20,000
    assert smoker_charge > non_smoker_charge + 20000


def test_validation_error_invalid_age(client):
    """Verify Pydantic rejects an age below 18 with HTTP 422."""
    payload = {
        "age": 12,  # Invalid: schema requires ge=18
        "sex": "male",
        "bmi": 22.0,
        "children": 0,
        "smoker": False,
        "region": "southwest",
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422