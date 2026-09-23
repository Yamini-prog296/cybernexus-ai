from typing import List


class RecommendationEngine:
    """
    Generates strictly DEFENSIVE Incident Response (IR) standard operating procedure
    recommendations based on detected attack patterns.
    """

    @staticmethod
    def generate_recommendations(attack_pattern: str) -> List[str]:
        pattern_lower = attack_pattern.lower()

        if "account compromise" in pattern_lower:
            return [
                "Verify recent account activity and initiate secondary out-of-band contact with user to confirm legitimate access.",
                "Review recent authentication events across enterprise SSO, VPN, and identity providers.",
                "Consider temporarily restricting the affected account session or revoking active OAuth tokens according to organizational policy.",
                "Inspect and isolate associated client endpoints and unknown device fingerprints.",
                "Review access logs for high-sensitivity files and database objects touched by the compromised credential."
            ]
        elif "data exfiltration" in pattern_lower:
            return [
                "Immediately review access history and query volume on targeted sensitive data repositories.",
                "Inspect outbound network telemetry, firewall logs, and proxy egress connections to identify destination IP/domain.",
                "Verify whether the data transfer was part of an approved scheduled backup or business operation.",
                "Preserve forensic evidence including network packet captures and database audit logs.",
                "Escalate to the Computer Security Incident Response Team (CSIRT) and follow enterprise breach response protocols."
            ]
        elif "privilege abuse" in pattern_lower:
            return [
                "Verify recent authorization history and IAM role changes with system administrators.",
                "Investigate affected administrative account credentials and audit logging configurations.",
                "Temporarily freeze newly granted elevated privileges pending formal change authorization review.",
                "Audit all actions executed under the elevated context within the affected timeframe.",
                "Preserve system audit evidence and notify identity and access governance team."
            ]
        elif "lateral movement" in pattern_lower:
            return [
                "Isolate originating host from the production network VLAN to contain potential traversal.",
                "Inspect internal RPC, SMB, and RDP connection logs across adjacent internal subnets.",
                "Revoke active Kerberos tickets and reset local administrator passwords on impacted nodes.",
                "Deploy heightened endpoint detection and monitoring across all reachable internal workstations.",
                "Conduct internal threat hunt for unexpected scheduled tasks or anomalous service registrations."
            ]
        else:
            return [
                "Investigate correlated event sequence and confirm veracity with resource owners.",
                "Conduct deep inspection on telemetry originating from the flagged IP addresses and user accounts.",
                "Enforce multi-factor re-authentication for all active sessions involving the affected entities.",
                "Monitor correlated assets closely for subsequent anomalous telemetry in the next 24 hours.",
                "Document timeline and findings in the enterprise security ticketing system."
            ]


recommendation_engine = RecommendationEngine()
