import re
import datetime
from typing import Dict, Any, Optional
from app.utils.helpers import generate_event_id


class EventNormalizer:
    """
    Normalizes heterogeneous multi-source security events into a standard canonical format.
    Handles Authentication, Network, Endpoint, Application, Database, Firewall, Cloud.
    """

    SOURCE_TYPES = [
        "AUTHENTICATION", "NETWORK", "ENDPOINT", "APPLICATION",
        "DATABASE", "FIREWALL", "CLOUD"
    ]

    @staticmethod
    def normalize(raw_input: Any) -> Dict[str, Any]:
        """
        Ingests either a dict, an object, or a raw log string and normalizes it.
        """
        if isinstance(raw_input, str):
            return EventNormalizer._normalize_raw_string(raw_input)
        elif isinstance(raw_input, dict):
            return EventNormalizer._normalize_dict(raw_input)
        else:
            return EventNormalizer._normalize_dict(dict(raw_input))

    @staticmethod
    def _normalize_dict(data: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.datetime.utcnow()
        timestamp = data.get("timestamp")
        if isinstance(timestamp, str):
            try:
                timestamp = datetime.datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            except Exception:
                timestamp = now
        elif not isinstance(timestamp, datetime.datetime):
            timestamp = now

        source_type = (data.get("source_type") or data.get("source") or "AUTHENTICATION").upper()
        if source_type not in EventNormalizer.SOURCE_TYPES:
            source_type = "APPLICATION"

        event_type = (data.get("event_type") or data.get("action") or "GENERIC_EVENT").upper()
        user = data.get("user") or data.get("actor") or data.get("username")
        device = data.get("device") or data.get("hostname") or data.get("workstation")
        ip_address = data.get("ip_address") or data.get("ip") or data.get("src_ip")
        location = data.get("location") or "Chennai, IN"
        resource = data.get("resource") or data.get("target") or data.get("file")
        action = data.get("action") or event_type
        status = (data.get("status") or "SUCCESS").upper()

        # Severity baseline
        severity = (data.get("severity") or "LOW").upper()
        if severity not in ["LOW", "MEDIUM", "HIGH", "CRITICAL", "INFO"]:
            severity = "LOW"

        raw_message = data.get("raw_message") or f"{source_type} {event_type} user={user} ip={ip_address} resource={resource}"

        # Risk indicators extracted into normalized_data
        risk_indicators = data.get("risk_indicators", [])
        if "FAILED" in event_type or status == "FAILED":
            risk_indicators.append("auth_failure")
        if "UNUSUAL" in event_type or "ANOMALY" in event_type:
            risk_indicators.append("statistical_anomaly")
        if "SENSITIVE" in event_type or (resource and "sensitive" in resource.lower()):
            risk_indicators.append("critical_asset_touch")
        if "OUTBOUND" in event_type:
            risk_indicators.append("potential_egress")

        normalized = {
            "id": data.get("id") or generate_event_id(),
            "timestamp": timestamp,
            "source_type": source_type,
            "source_name": data.get("source_name") or f"{source_type.lower()}_sensor_01",
            "event_type": event_type,
            "user": user,
            "device": device,
            "ip_address": ip_address,
            "location": location,
            "resource": resource,
            "action": action,
            "status": status,
            "severity": severity,
            "raw_message": raw_message,
            "normalized_data": {
                "canonical_source": source_type,
                "actor": user,
                "device_id": device,
                "network_endpoint": ip_address,
                "target_resource": resource,
                "risk_indicators": list(set(risk_indicators))
            },
            "anomaly_score": float(data.get("anomaly_score", 0.0))
        }
        return normalized

    @staticmethod
    def _normalize_raw_string(raw_str: str) -> Dict[str, Any]:
        """
        Parses common log strings like:
        'user=alex login failed from 10.0.0.21'
        'IP 10.0.0.5 unusual outbound connection to 198.51.100.20'
        'user=alex accessed sensitive file customer_financial_records.xlsx'
        """
        user_match = re.search(r"user=([\w.-]+)", raw_str, re.IGNORECASE)
        ip_match = re.search(r"(?:ip=|from\s+|IP\s+)([\d.]+)", raw_str, re.IGNORECASE)
        device_match = re.search(r"device=([\w.-]+)", raw_str, re.IGNORECASE)
        resource_match = re.search(r"(?:file|resource|table)=([\w./-]+)", raw_str, re.IGNORECASE)

        user = user_match.group(1) if user_match else None
        ip_address = ip_match.group(1) if ip_match else None
        device = device_match.group(1) if device_match else None
        resource = resource_match.group(1) if resource_match else None

        source_type = "AUTHENTICATION"
        event_type = "UNSPECIFIED_EVENT"
        severity = "LOW"
        status = "SUCCESS"

        raw_lower = raw_str.lower()
        if "login failed" in raw_lower or "failed login" in raw_lower:
            source_type = "AUTHENTICATION"
            event_type = "LOGIN_FAILED"
            status = "FAILED"
            severity = "MEDIUM"
        elif "outbound" in raw_lower or "traffic" in raw_lower:
            source_type = "NETWORK"
            event_type = "OUTBOUND_ANOMALY"
            severity = "HIGH"
        elif "sensitive" in raw_lower or "payroll" in raw_lower or "financial" in raw_lower:
            source_type = "ENDPOINT"
            event_type = "SENSITIVE_DATA_ACCESS"
            severity = "HIGH"
        elif "cloud" in raw_lower:
            source_type = "CLOUD"
            event_type = "UNUSUAL_CLOUD_LOGIN"
            severity = "MEDIUM"

        return EventNormalizer._normalize_dict({
            "source_type": source_type,
            "event_type": event_type,
            "user": user,
            "device": device,
            "ip_address": ip_address,
            "resource": resource,
            "status": status,
            "severity": severity,
            "raw_message": raw_str
        })
