import datetime
from typing import List, Dict, Any, Tuple
from collections import defaultdict


class CorrelationEngine:
    """
    Core Event Correlation Engine for CyberNexus AI.
    Connects disparate security events across:
    - User identity
    - IP address
    - Device fingerprint
    - Target Resource
    - Temporal Proximity (0-5m, 5-15m, 15-60m, >60m)
    - Sequential Multi-Stage Attack Chains
    """

    TEMPORAL_WEIGHTS = {
        (0, 5): 1.0,     # Strong relationship
        (5, 15): 0.7,    # Moderate relationship
        (15, 60): 0.3,   # Weak relationship
        (60, 99999): 0.1 # Minimal relationship
    }

    @staticmethod
    def get_temporal_weight(delta_minutes: float) -> float:
        for (min_m, max_m), weight in CorrelationEngine.TEMPORAL_WEIGHTS.items():
            if min_m <= delta_minutes < max_m:
                return weight
        return 0.1

    def correlate_events(self, events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Groups raw/normalized events into correlated clusters.
        Each cluster represents a potential coordinated threat chain.
        """
        if not events:
            return []

        # Sort events chronologically
        def parse_ts(e):
            t = e.get("timestamp")
            if isinstance(t, str):
                try:
                    return datetime.datetime.fromisoformat(t.replace("Z", "+00:00"))
                except Exception:
                    return datetime.datetime.utcnow()
            elif isinstance(t, datetime.datetime):
                return t
            return datetime.datetime.utcnow()

        sorted_events = sorted(events, key=parse_ts)

        # Build graph clusters via Union-Find or Connected Components on shared identifiers
        clusters: List[List[Dict[str, Any]]] = []

        for evt in sorted_events:
            evt_time = parse_ts(evt)
            matched_cluster = None

            for cluster in clusters:
                # Check link to any event in this cluster within 60 minutes
                for existing in cluster:
                    existing_time = parse_ts(existing)
                    delta_min = abs((evt_time - existing_time).total_seconds()) / 60.0

                    if delta_min <= 60.0:
                        # Check shared identity vectors
                        shares_user = evt.get("user") and evt.get("user") == existing.get("user")
                        shares_ip = evt.get("ip_address") and evt.get("ip_address") == existing.get("ip_address")
                        shares_device = evt.get("device") and evt.get("device") == existing.get("device")
                        shares_resource = evt.get("resource") and evt.get("resource") == existing.get("resource")

                        if shares_user or shares_ip or shares_device or (shares_resource and delta_min <= 15):
                            matched_cluster = cluster
                            break
                if matched_cluster:
                    break

            if matched_cluster:
                matched_cluster.append(evt)
            else:
                clusters.append([evt])

        # Analyze each cluster for coordinated attack patterns and calculate correlation scores
        incident_proposals = []
        for cluster in clusters:
            if len(cluster) >= 2 or any((e.get("anomaly_score") or 0) >= 50 for e in cluster):
                proposal = self._evaluate_cluster(cluster)
                incident_proposals.append(proposal)

        return incident_proposals

    def _evaluate_cluster(self, cluster: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes a correlated cluster, determines pattern, temporal density, and correlation score.
        """
        event_types = [e.get("event_type", "").upper() for e in cluster]
        sources = list(set(e.get("source_type", "").upper() for e in cluster))
        users = list(set(e.get("user") for e in cluster if e.get("user")))
        devices = list(set(e.get("device") for e in cluster if e.get("device")))
        ips = list(set(e.get("ip_address") for e in cluster if e.get("ip_address")))
        resources = list(set(e.get("resource") for e in cluster if e.get("resource")))

        # Calculate temporal closeness
        def parse_ts(e):
            t = e.get("timestamp")
            if isinstance(t, str):
                try:
                    return datetime.datetime.fromisoformat(t.replace("Z", "+00:00"))
                except Exception:
                    return datetime.datetime.utcnow()
            return t or datetime.datetime.utcnow()

        timestamps = [parse_ts(e) for e in cluster]
        min_ts = min(timestamps)
        max_ts = max(timestamps)
        duration_minutes = max(1.0, (max_ts - min_ts).total_seconds() / 60.0)

        # Baseline correlation score
        correlation_score = 0.0

        # Identity cross-correlation points (up to 40)
        if len(users) == 1 and users[0]:
            correlation_score += 25.0
        if len(ips) >= 1:
            correlation_score += 15.0

        # Multi-source convergence (up to 25)
        # Having logs from 3+ distinct sources (e.g. AUTH, ENDPOINT, NETWORK) proves coordination
        source_count = len(sources)
        if source_count >= 3:
            correlation_score += 25.0
        elif source_count == 2:
            correlation_score += 15.0

        # Temporal proximity weighting (up to 20)
        temporal_weight = self.get_temporal_weight(duration_minutes)
        correlation_score += (20.0 * temporal_weight)

        # Detect specific coordinated attack patterns
        pattern, pattern_confidence, title, desc = self._match_attack_pattern(event_types, cluster)

        if pattern != "Potential Coordinated Incident":
            correlation_score += 15.0  # Sequence bonus

        correlation_score = round(min(100.0, max(20.0, correlation_score)), 1)

        return {
            "title": title,
            "description": desc,
            "attack_pattern": pattern,
            "confidence": pattern_confidence,
            "correlation_score": correlation_score,
            "first_seen": min_ts,
            "last_seen": max_ts,
            "affected_users": users,
            "affected_devices": devices,
            "affected_ips": ips,
            "affected_resources": resources,
            "event_count": len(cluster),
            "sources": sources,
            "events": cluster
        }

    def _match_attack_pattern(self, types: List[str], cluster: List[Dict[str, Any]]) -> Tuple[str, float, str, str]:
        """
        Detects safe simulated coordinated sequences:
        Pattern 1: Potential Account Compromise
        Pattern 2: Potential Data Exfiltration
        Pattern 3: Potential Privilege Abuse
        Pattern 4: Potential Lateral Movement
        """
        types_set = set(types)

        # Pattern 1: Potential Account Compromise
        # Failed logins -> successful unusual login -> new device -> sensitive access
        has_failed = "LOGIN_FAILED" in types_set or "MFA_FAILURE" in types_set
        has_success = "LOGIN_SUCCESS" in types_set or "UNUSUAL_LOGIN" in types_set
        has_new_dev = "NEW_DEVICE_LOGIN" in types_set or any("device" in (e.get("raw_message") or "").lower() for e in cluster)
        has_sensitive = "SENSITIVE_DATA_ACCESS" in types_set or any(e.get("resource") and "financial" in e.get("resource").lower() for e in cluster)
        has_outbound = "OUTBOUND_ANOMALY" in types_set or "UNUSUAL_TRAFFIC" in types_set

        if (has_failed or has_new_dev) and has_sensitive and (has_outbound or has_success):
            return (
                "Potential Account Compromise",
                91.0,
                f"Potential Account Compromise: Multiple Authentication Anomalies Preceding Sensitive Access",
                "Correlated sequence indicates repeated authentication attempts followed by unauthorized access from an atypical device and abnormal egress telemetry."
            )

        # Pattern 2: Potential Data Exfiltration
        # Sensitive file access -> unusual database query -> abnormal outbound activity
        has_query = "UNUSUAL_QUERY" in types_set or "DATABASE" in [e.get("source_type") for e in cluster]
        if has_sensitive and (has_query or has_outbound):
            return (
                "Potential Data Exfiltration",
                88.0,
                "Potential Data Exfiltration: Correlated Bulk Query and Anomalous Egress",
                "Disparate database and endpoint events indicate bulk extraction of sensitive enterprise records coupled with high-volume outbound network traffic."
            )

        # Pattern 3: Potential Privilege Abuse
        # Repeated authentication anomalies -> privilege change -> sensitive resource access
        has_priv_change = "PRIVILEGE_CHANGE" in types_set or "PERMISSION_CHANGE" in types_set
        if has_priv_change and (has_failed or has_sensitive or has_success):
            return (
                "Potential Privilege Abuse",
                86.0,
                "Potential Privilege Abuse: Unauthorized Permission Escalation",
                "Telemetry reveals unexpected elevation of user permissions immediately followed by administrative directory inspection and asset modification."
            )

        # Pattern 4: Potential Lateral Movement
        # Unusual authentication -> new internal device interaction -> unusual access pattern
        has_recon = "PORT_SCAN_INDICATOR" in types_set or "UNUSUAL_CONNECTION" in types_set
        if has_recon or (len(set(e.get("device") for e in cluster if e.get("device"))) >= 2 and has_success):
            return (
                "Potential Lateral Movement",
                84.0,
                "Potential Lateral Movement: Sequential Workstation Traversal",
                "Correlated events across internal network nodes show suspicious remote service connections and internal host enumeration."
            )

        # Default multi-event incident
        return (
            "Potential Coordinated Incident",
            78.0,
            f"Correlated Multi-Source Telemetry Cluster ({len(cluster)} Events)",
            "A cluster of security events across multiple telemetry sensors linked by common identity vectors within a tight temporal window."
        )


correlation_engine = CorrelationEngine()
