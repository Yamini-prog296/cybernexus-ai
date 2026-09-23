import datetime
import pytest
from app.services.correlation_engine import correlation_engine


def test_temporal_weights():
    # 0-5 minutes: 1.0
    assert correlation_engine.get_temporal_weight(3.0) == 1.0
    # 5-15 minutes: 0.7
    assert correlation_engine.get_temporal_weight(10.0) == 0.7
    # 15-60 minutes: 0.3
    assert correlation_engine.get_temporal_weight(35.0) == 0.3
    # >60 minutes: 0.1
    assert correlation_engine.get_temporal_weight(120.0) == 0.1


def test_account_compromise_pattern_detection():
    now = datetime.datetime.utcnow()
    events = [
        {
            "id": "e1",
            "timestamp": now,
            "source_type": "AUTHENTICATION",
            "event_type": "LOGIN_FAILED",
            "user": "alex",
            "device": "DEV-01",
            "ip_address": "198.51.100.20",
            "resource": "portal",
            "anomaly_score": 50.0
        },
        {
            "id": "e2",
            "timestamp": now + datetime.timedelta(minutes=2),
            "source_type": "AUTHENTICATION",
            "event_type": "LOGIN_SUCCESS",
            "user": "alex",
            "device": "DEV-01",
            "ip_address": "198.51.100.20",
            "resource": "portal",
            "anomaly_score": 70.0
        },
        {
            "id": "e3",
            "timestamp": now + datetime.timedelta(minutes=4),
            "source_type": "ENDPOINT",
            "event_type": "SENSITIVE_DATA_ACCESS",
            "user": "alex",
            "device": "DEV-01",
            "ip_address": "198.51.100.20",
            "resource": "customer_financial_records.xlsx",
            "anomaly_score": 85.0
        },
        {
            "id": "e4",
            "timestamp": now + datetime.timedelta(minutes=6),
            "source_type": "NETWORK",
            "event_type": "OUTBOUND_ANOMALY",
            "user": "alex",
            "device": "DEV-01",
            "ip_address": "198.51.100.20",
            "resource": "egress_channel",
            "anomaly_score": 90.0
        }
    ]

    clusters = correlation_engine.correlate_events(events)
    assert len(clusters) == 1
    cluster = clusters[0]
    assert cluster["attack_pattern"] == "Potential Account Compromise"
    assert cluster["correlation_score"] >= 70.0
    assert cluster["event_count"] == 4
    assert "alex" in cluster["affected_users"]
