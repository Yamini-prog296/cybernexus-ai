import pytest
from app.services.risk_engine import risk_engine


def test_risk_formula_calculation():
    """
    Verifies that Risk Score =
    30% Anomaly Score + 25% Correlation Score + 20% Behavioural Deviation + 15% Asset Sensitivity + 10% Event Severity
    """
    anomaly = 90.0
    correlation = 80.0
    behaviour = 70.0
    sensitivity = 95.0
    severity = 100.0

    # Expected: (0.30 * 90) + (0.25 * 80) + (0.20 * 70) + (0.15 * 95) + (0.10 * 100)
    # = 27.0 + 20.0 + 14.0 + 14.25 + 10.0 = 85.25 -> 85.2 or 85.3
    expected_score = round((0.30 * 90.0) + (0.25 * 80.0) + (0.20 * 70.0) + (0.15 * 95.0) + (0.10 * 100.0), 1)

    score, sev, breakdown = risk_engine.calculate_risk(
        anomaly_score=anomaly,
        correlation_score=correlation,
        behaviour_score=behaviour,
        sensitivity_score=sensitivity,
        severity_score=severity
    )

    assert score == expected_score
    assert score >= 76.0
    assert sev == "CRITICAL"
    assert breakdown["weights"]["anomaly"] == 0.30
    assert breakdown["weights"]["correlation"] == 0.25
    assert breakdown["weights"]["behaviour"] == 0.20
    assert breakdown["weights"]["sensitivity"] == 0.15
    assert breakdown["weights"]["severity"] == 0.10


def test_severity_classifications():
    # 0-25: LOW
    s1, sev1, _ = risk_engine.calculate_risk(20, 20, 20, 20, 20)
    assert sev1 == "LOW"

    # 26-50: MEDIUM
    s2, sev2, _ = risk_engine.calculate_risk(40, 40, 40, 40, 40)
    assert sev2 == "MEDIUM"

    # 51-75: HIGH
    s3, sev3, _ = risk_engine.calculate_risk(65, 65, 65, 65, 65)
    assert sev3 == "HIGH"

    # 76-100: CRITICAL
    s4, sev4, _ = risk_engine.calculate_risk(90, 90, 90, 90, 90)
    assert sev4 == "CRITICAL"
