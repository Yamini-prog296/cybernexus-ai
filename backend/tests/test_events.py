import pytest
from app.services.event_normalizer import EventNormalizer


def test_normalize_dict_event():
    raw_data = {
        "source": "AUTHENTICATION",
        "action": "LOGIN_FAILED",
        "actor": "alex",
        "ip": "10.0.0.21",
        "workstation": "WKSTN-ALEX",
        "target": "active_directory",
        "status": "failed",
        "severity": "medium"
    }

    normalized = EventNormalizer.normalize(raw_data)
    assert normalized["source_type"] == "AUTHENTICATION"
    assert normalized["event_type"] == "LOGIN_FAILED"
    assert normalized["user"] == "alex"
    assert normalized["ip_address"] == "10.0.0.21"
    assert normalized["device"] == "WKSTN-ALEX"
    assert normalized["resource"] == "active_directory"
    assert normalized["status"] == "FAILED"
    assert normalized["severity"] == "MEDIUM"
    assert "auth_failure" in normalized["normalized_data"]["risk_indicators"]


def test_normalize_raw_string_event():
    raw_str = "user=alex login failed from 10.0.0.21"
    normalized = EventNormalizer.normalize(raw_str)
    assert normalized["user"] == "alex"
    assert normalized["ip_address"] == "10.0.0.21"
    assert normalized["event_type"] == "LOGIN_FAILED"
    assert normalized["source_type"] == "AUTHENTICATION"
    assert normalized["status"] == "FAILED"
