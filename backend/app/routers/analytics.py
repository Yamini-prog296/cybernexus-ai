from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app.models import SecurityEventModel, IncidentModel
from app.schemas import AnalyticsSummary

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsSummary)
def get_analytics(db: Session = Depends(get_db)):
    # 1. Events by source
    events = db.query(SecurityEventModel).all()
    events_by_source = defaultdict(int)
    anomaly_categories = defaultdict(int)
    user_anomalies = defaultdict(float)
    resource_hits = defaultdict(int)

    # Timeline buckets (by hour/slice)
    time_buckets = defaultdict(int)

    for e in events:
        events_by_source[e.source_type] += 1
        if e.anomaly_score >= 40.0:
            if e.source_type == "AUTHENTICATION":
                anomaly_categories["Authentication Anomalies"] += 1
            elif e.source_type == "NETWORK":
                anomaly_categories["Network Anomalies"] += 1
            elif e.source_type == "ENDPOINT":
                anomaly_categories["Endpoint Anomalies"] += 1
            else:
                anomaly_categories[f"{e.source_type.capitalize()} Anomalies"] += 1

        if e.user:
            user_anomalies[e.user] += (e.anomaly_score or 0.0)
        if e.resource:
            resource_hits[e.resource] += 1

        hour_label = e.timestamp.strftime("%H:00") if e.timestamp else "12:00"
        time_buckets[hour_label] += 1

    # Events over time formatted
    sorted_hours = sorted(time_buckets.keys())
    events_over_time = [{"time": h, "count": time_buckets[h]} for h in sorted_hours]
    if not events_over_time:
        events_over_time = [
            {"time": "05:00", "count": 2},
            {"time": "06:00", "count": 3},
            {"time": "07:00", "count": 3},
            {"time": "08:00", "count": 3},
            {"time": "09:00", "count": 11}
        ]

    # Top anomalous users
    sorted_users = sorted(user_anomalies.items(), key=lambda x: x[1], reverse=True)[:5]
    top_anomalous_users = [{"user": u, "cumulative_anomaly": round(s, 1)} for u, s in sorted_users]

    # Top affected resources
    sorted_res = sorted(resource_hits.items(), key=lambda x: x[1], reverse=True)[:6]
    top_affected_resources = [{"resource": r, "access_count": c} for r, c in sorted_res]

    # Incidents statistics
    incidents = db.query(IncidentModel).all()
    incidents_by_severity = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    risk_distribution = {"0-25 (Low)": 0, "26-50 (Med)": 0, "51-75 (High)": 0, "76-100 (Crit)": 0}

    total_risk = 0.0
    for inc in incidents:
        incidents_by_severity[inc.severity] = incidents_by_severity.get(inc.severity, 0) + 1
        total_risk += inc.risk_score

        if inc.risk_score >= 76:
            risk_distribution["76-100 (Crit)"] += 1
        elif inc.risk_score >= 51:
            risk_distribution["51-75 (High)"] += 1
        elif inc.risk_score >= 26:
            risk_distribution["26-50 (Med)"] += 1
        else:
            risk_distribution["0-25 (Low)"] += 1

    avg_risk = round(total_risk / len(incidents), 1) if incidents else 0.0

    return AnalyticsSummary(
        events_by_source=dict(events_by_source),
        events_over_time=events_over_time,
        risk_distribution=risk_distribution,
        incidents_by_severity=incidents_by_severity,
        top_anomalous_users=top_anomalous_users,
        top_affected_resources=top_affected_resources,
        anomaly_categories=dict(anomaly_categories),
        average_risk_score=avg_risk
    )
