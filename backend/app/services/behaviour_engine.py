import datetime
from typing import Dict, Any, List, Tuple


class BehaviourEngine:
    """
    Tracks and compares entity activities against behavioural baselines.
    Produces Behavioural Deviation Score (0 to 100) and analytical findings.
    """

    DEFAULT_BASELINES = {
        "alex": {
            "typical_hours": list(range(8, 19)),
            "known_ips": ["10.0.0.21", "10.0.0.22", "192.168.1.105"],
            "known_devices": ["WKSTN-ALEX-01", "MAC-ALEX-FIN"],
            "known_locations": ["Chennai, IN"],
            "typical_resources": ["workstation", "jira", "git_repo_frontend"]
        },
        "maya": {
            "typical_hours": list(range(9, 20)),
            "known_ips": ["10.0.0.35", "10.0.0.36"],
            "known_devices": ["WKSTN-MAYA-DEV"],
            "known_locations": ["Chennai, IN"],
            "typical_resources": ["analytics_db", "dashboard_service"]
        },
        "sam": {
            "typical_hours": list(range(7, 18)),
            "known_ips": ["10.0.0.42"],
            "known_devices": ["LAPTOP-SAM-OPS"],
            "known_locations": ["Chennai, IN"],
            "typical_resources": ["k8s_cluster", "infra_monitoring"]
        },
        "arun": {
            "typical_hours": list(range(9, 18)),
            "known_ips": ["10.0.0.50"],
            "known_devices": ["WKSTN-ARUN-SEC"],
            "known_locations": ["Chennai, IN"],
            "typical_resources": ["siem_console", "audit_logs"]
        },
        "dev_user": {
            "typical_hours": list(range(9, 21)),
            "known_ips": ["10.0.0.60"],
            "known_devices": ["CI-BUILDER-01", "DEV-WORKBENCH"],
            "known_locations": ["Chennai, IN"],
            "typical_resources": ["ci_cd_pipeline", "staging_env"]
        }
    }

    def evaluate_event(self, event: Dict[str, Any]) -> Tuple[float, List[str]]:
        """
        Evaluates an individual event against baseline profiles.
        Returns: (deviation_score: float 0-100, findings: List[str])
        """
        user = event.get("user")
        if not user or user.lower() not in self.DEFAULT_BASELINES:
            # For unknown entities, baseline defaults to standard working hours & internal IPs
            baseline = {
                "typical_hours": list(range(8, 19)),
                "known_ips": ["10.0.0.1", "10.0.0.2"],
                "known_devices": [],
                "known_locations": ["Chennai, IN"],
                "typical_resources": []
            }
        else:
            baseline = self.DEFAULT_BASELINES[user.lower()]

        score = 0.0
        findings = []

        # 1. Login Time Deviation
        ts = event.get("timestamp") or datetime.datetime.utcnow()
        if isinstance(ts, str):
            try:
                ts = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except Exception:
                ts = datetime.datetime.utcnow()

        hour = ts.hour if hasattr(ts, "hour") else 12
        if hour not in baseline["typical_hours"]:
            score += 25.0
            findings.append(f"Potential anomaly detected: Activity at {hour:02d}:00 is outside typical working hours ({min(baseline['typical_hours'])}:00-{max(baseline['typical_hours'])}:00)")

        # 2. Location Deviation
        location = event.get("location")
        if location and location not in baseline["known_locations"]:
            score += 30.0
            findings.append(f"Potential anomaly detected: Activity originated from atypical location '{location}' (Baseline: {', '.join(baseline['known_locations'])})")

        # 3. New / Unrecognized Device
        device = event.get("device")
        if device and baseline["known_devices"] and device not in baseline["known_devices"]:
            score += 25.0
            findings.append(f"Potential anomaly detected: Hardware fingerprint '{device}' has not been observed in baseline profile")

        # 4. Unusual Target Resource
        resource = event.get("resource")
        if resource and baseline["typical_resources"] and resource not in baseline["typical_resources"]:
            score += 20.0
            findings.append(f"Potential anomaly detected: Target resource '{resource}' deviates from typical usage portfolio")

        # 5. IP Address Deviation
        ip = event.get("ip_address")
        if ip and baseline["known_ips"] and ip not in baseline["known_ips"]:
            score += 15.0
            findings.append(f"Potential anomaly detected: Network address '{ip}' has not been previously associated with this entity")

        final_score = min(100.0, score)
        return final_score, findings


behaviour_engine = BehaviourEngine()
