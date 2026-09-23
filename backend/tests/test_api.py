import pytest
from fastapi.testclient import TestClient
from main import app


def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["soc_system"] == "OPERATIONAL"


def test_demo_start_and_incidents():
    with TestClient(app) as client:
        # Trigger demo start
        start_resp = client.post("/api/demo/start")
        assert start_resp.status_code == 200
        start_data = start_resp.json()
        assert start_data["status"] == "success"
        assert start_data["events_ingested"] >= 20

        # Test incidents list
        inc_resp = client.get("/api/incidents")
        assert inc_resp.status_code == 200
        incidents = inc_resp.json()
        assert len(incidents) >= 1

        # Verify prioritization: first incident has highest or equal risk_score
        for i in range(len(incidents) - 1):
            assert incidents[i]["risk_score"] >= incidents[i+1]["risk_score"]

        first_inc = incidents[0]
        # Test incident details
        detail_resp = client.get(f"/api/incidents/{first_inc['id']}")
        assert detail_resp.status_code == 200
        detail = detail_resp.json()
        assert "correlated_events" in detail
        assert "ai_explanation" in detail
        assert "recommended_action" in detail

        # Test status patch
        patch_resp = client.patch(f"/api/incidents/{first_inc['id']}/status", json={"status": "INVESTIGATING"})
        assert patch_resp.status_code == 200
        assert patch_resp.json()["status"] == "INVESTIGATING"


def test_dashboard_and_analytics():
    with TestClient(app) as client:
        dash_resp = client.get("/api/dashboard/stats")
        assert dash_resp.status_code == 200
        dash_data = dash_resp.json()
        assert dash_data["total_events"] >= 20
        assert dash_data["system_status"] == "OPERATIONAL"

        live_resp = client.get("/api/dashboard/live-events")
        assert live_resp.status_code == 200
        assert isinstance(live_resp.json(), list)

        analytics_resp = client.get("/api/analytics")
        assert analytics_resp.status_code == 200
        analytics_data = analytics_resp.json()
        assert "events_by_source" in analytics_data
        assert "risk_distribution" in analytics_data
