from typing import Dict, Any, Tuple
from app.utils.helpers import map_severity_from_score


class RiskEngine:
    """
    Computes risk score using the official 5-factor weighted formula:
    Risk Score = (30% Anomaly Score)
               + (25% Correlation Score)
               + (20% Behavioural Deviation)
               + (15% Asset/Resource Sensitivity)
               + (10% Event Severity)
    """

    WEIGHT_ANOMALY = 0.30
    WEIGHT_CORRELATION = 0.25
    WEIGHT_BEHAVIOUR = 0.20
    WEIGHT_SENSITIVITY = 0.15
    WEIGHT_SEVERITY = 0.10

    @staticmethod
    def calculate_risk(
        anomaly_score: float,
        correlation_score: float,
        behaviour_score: float,
        sensitivity_score: float,
        severity_score: float
    ) -> Tuple[float, str, Dict[str, Any]]:
        """
        Calculates normalized Risk Score (0-100), severity classification, and factor breakdown.
        """
        # Clamp inputs 0-100
        a = min(100.0, max(0.0, float(anomaly_score)))
        c = min(100.0, max(0.0, float(correlation_score)))
        b = min(100.0, max(0.0, float(behaviour_score)))
        s = min(100.0, max(0.0, float(sensitivity_score)))
        v = min(100.0, max(0.0, float(severity_score)))

        raw_risk = (
            (RiskEngine.WEIGHT_ANOMALY * a) +
            (RiskEngine.WEIGHT_CORRELATION * c) +
            (RiskEngine.WEIGHT_BEHAVIOUR * b) +
            (RiskEngine.WEIGHT_SENSITIVITY * s) +
            (RiskEngine.WEIGHT_SEVERITY * v)
        )

        final_risk = round(min(100.0, max(0.0, raw_risk)), 1)
        severity = map_severity_from_score(final_risk)

        breakdown = {
            "weights": {
                "anomaly": 0.30,
                "correlation": 0.25,
                "behaviour": 0.20,
                "sensitivity": 0.15,
                "severity": 0.10
            },
            "components": {
                "anomaly_score": round(a, 1),
                "correlation_score": round(c, 1),
                "behaviour_score": round(b, 1),
                "sensitivity_score": round(s, 1),
                "severity_score": round(v, 1)
            },
            "contributions": {
                "anomaly_contribution": round(RiskEngine.WEIGHT_ANOMALY * a, 2),
                "correlation_contribution": round(RiskEngine.WEIGHT_CORRELATION * c, 2),
                "behaviour_contribution": round(RiskEngine.WEIGHT_BEHAVIOUR * b, 2),
                "sensitivity_contribution": round(RiskEngine.WEIGHT_SENSITIVITY * s, 2),
                "severity_contribution": round(RiskEngine.WEIGHT_SEVERITY * v, 2)
            },
            "final_risk_score": final_risk,
            "severity_level": severity
        }

        return final_risk, severity, breakdown


risk_engine = RiskEngine()
