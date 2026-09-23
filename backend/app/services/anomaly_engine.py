import datetime
from typing import Dict, Any, List
from app.utils.helpers import get_resource_sensitivity


class AnomalyEngine:
    """
    Statistical and heuristic Anomaly Detection Engine.
    Produces an Anomaly Score from 0 to 100 for each event.
    """

    @staticmethod
    def calculate_anomaly_score(event: Dict[str, Any], recent_history: List[Dict[str, Any]] = None) -> float:
        """
        Calculates individual event anomaly score based on:
        - Event type risk weight
        - Timestamp (off-hours e.g. 00:00 to 05:00)
        - Geolocation deviations
        - Failure frequency spikes
        - Resource sensitivity
        - Network volume or anomaly indicators
        """
        score = 0.0
        event_type = (event.get("event_type") or "").upper()
        severity = (event.get("severity") or "LOW").upper()
        ts = event.get("timestamp") or datetime.datetime.utcnow()
        if isinstance(ts, str):
            try:
                ts = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.datetime.utcnow()

        # 1. Base Event Type Weight (0 to 35)
        high_risk_types = {
            "OUTBOUND_ANOMALY": 35.0,
            "SENSITIVE_DATA_ACCESS": 35.0,
            "PRIVILEGE_CHANGE": 30.0,
            "PERMISSION_CHANGE": 30.0,
            "PORT_SCAN_INDICATOR": 28.0,
            "PROCESS_ANOMALY": 25.0,
            "FILE_ACCESS_ANOMALY": 25.0,
            "UNUSUAL_LOGIN": 24.0,
            "NEW_DEVICE_LOGIN": 22.0,
            "MFA_FAILURE": 20.0,
            "LOGIN_FAILED": 18.0,
            "ACCESS_DENIED_SPIKE": 22.0,
            "UNUSUAL_QUERY": 25.0,
            "UNUSUAL_TRAFFIC": 24.0
        }
        score += high_risk_types.get(event_type, 5.0)

        # 2. Off-Hours Check (00:00 - 05:00 UTC/Local) (+15)
        hour = ts.hour if hasattr(ts, "hour") else 12
        if 0 <= hour <= 5:
            score += 15.0

        # 3. Location Deviation (+15)
        loc = (event.get("location") or "").lower()
        if loc and loc not in ["chennai, in", "office_hq", "internal", "local"]:
            score += 18.0

        # 4. Resource Sensitivity Factor (+15)
        resource = event.get("resource") or ""
        sensitivity = get_resource_sensitivity(resource)
        if sensitivity >= 80:
            score += 18.0
        elif sensitivity >= 50:
            score += 10.0

        # 5. Repeated Failure Spike Check (+15)
        if recent_history and event.get("user"):
            user = event.get("user")
            user_failures = sum(
                1 for h in recent_history[-20:]
                if h.get("user") == user and ("FAIL" in h.get("event_type", "") or h.get("status") == "FAILED")
            )
            if user_failures >= 3:
                score += min(18.0, user_failures * 4.0)

        # 6. Severity boost (+10)
        if severity == "CRITICAL":
            score += 15.0
        elif severity == "HIGH":
            score += 10.0
        elif severity == "MEDIUM":
            score += 5.0

        # Clamp score between 0.0 and 100.0
        return round(min(100.0, max(0.0, score)), 1)


anomaly_engine = AnomalyEngine()
