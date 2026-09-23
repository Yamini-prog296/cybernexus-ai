from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database import get_db
from app.models import SecurityEventModel, IncidentModel
from app.schemas import DashboardStats, SecurityEventResponse
from app.services.ai_provider import ai_provider

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_events = db.query(SecurityEventModel).count()
    active_incidents = db.query(IncidentModel).filter(IncidentModel.status != "RESOLVED").count()
    critical_incidents = (
        db.query(IncidentModel)
        .filter(IncidentModel.severity == "CRITICAL", IncidentModel.status != "RESOLVED")
        .count()
    )
    high_risk_incidents = (
        db.query(IncidentModel)
        .filter(IncidentModel.risk_score >= 70.0, IncidentModel.status != "RESOLVED")
        .count()
    )
    anomalies_detected = (
        db.query(SecurityEventModel)
        .filter(SecurityEventModel.anomaly_score >= 50.0)
        .count()
    )

    # Distinct affected users
    all_active = db.query(IncidentModel).filter(IncidentModel.status != "RESOLVED").all()
    user_set = set()
    total_risk = 0.0
    for inc in all_active:
        if inc.affected_users:
            user_set.update(inc.affected_users)
        total_risk += (inc.risk_score or 0.0)

    avg_risk = round(total_risk / len(all_active), 1) if all_active else 0.0

    return DashboardStats(
        total_events=total_events,
        active_incidents=active_incidents,
        critical_incidents=critical_incidents,
        high_risk_incidents=high_risk_incidents,
        anomalies_detected=anomalies_detected,
        affected_users_count=len(user_set),
        system_status="OPERATIONAL",
        ai_provider=ai_provider.get_active_provider_name(),
        average_risk_score=avg_risk
    )


@router.get("/live-events", response_model=List[SecurityEventResponse])
def get_live_events(limit: int = 15, db: Session = Depends(get_db)):
    """
    Returns latest stream slice for real-time SOC ticker.
    """
    return (
        db.query(SecurityEventModel)
        .order_by(desc(SecurityEventModel.timestamp))
        .limit(limit)
        .all()
    )
