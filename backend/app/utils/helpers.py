import uuid
from datetime import datetime


def generate_event_id() -> str:
    """Generate a unique event identifier."""
    return f"evt_{uuid.uuid4().hex[:12]}"


def generate_incident_id(counter: int = 1) -> str:
    """Generate a structured SOC incident identifier."""
    rand_suffix = uuid.uuid4().hex[:4].upper()
    return f"INC-2026-{counter:03d}-{rand_suffix}"


def get_resource_sensitivity(resource_name: str) -> float:
    """
    Returns asset sensitivity weight (0 to 100).
    Critical enterprise assets have higher sensitivity.
    """
    if not resource_name:
        return 20.0

    res_lower = resource_name.lower()

    if any(k in res_lower for k in [
        "customer_financial_records", "payroll", "executive_strategy",
        "private_keys", "secret", "pII", "credit_card", "db_master", "prod_vault"
    ]):
        return 95.0
    elif any(k in res_lower for k in [
        "database", "sales_q4", "source_code", "iam", "active_directory",
        "ldap", "admin", "cloud_tokens"
    ]):
        return 75.0
    elif any(k in res_lower for k in [
        "internal_wiki", "jira", "jira_backup", "slack_archives", "workstation"
    ]):
        return 45.0
    else:
        return 20.0


def map_severity_from_score(score: float) -> str:
    """
    Classification:
    0-25: LOW
    26-50: MEDIUM
    51-75: HIGH
    76-100: CRITICAL
    """
    if score >= 76.0:
        return "CRITICAL"
    elif score >= 51.0:
        return "HIGH"
    elif score >= 26.0:
        return "MEDIUM"
    else:
        return "LOW"
