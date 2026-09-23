from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import IncidentModel, SecurityEventModel, IncidentEventLink
from app.schemas import IncidentResponse, IncidentDetailResponse, IncidentStatusUpdate, IncidentAnalyzeRequest
from app.services.correlation_engine import correlation_engine
from app.services.incident_engine import incident_engine

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


@router.get("", response_model=List[IncidentResponse])
def list_incidents(
    status: Optional[str] = Query(None, description="Filter by status: NEW, ACKNOWLEDGED, INVESTIGATING, RESOLVED"),
    severity: Optional[str] = Query(None, description="Filter by severity: LOW, MEDIUM, HIGH, CRITICAL"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(IncidentModel)
    if status:
        query = query.filter(IncidentModel.status == status.upper())
    if severity:
        query = query.filter(IncidentModel.severity == severity.upper())

    # Strictly prioritized by risk_score descending
    return query.order_by(desc(IncidentModel.risk_score)).offset(offset).limit(limit).all()


@router.get("/{incident_id}", response_model=IncidentDetailResponse)
def get_incident_details(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Fetch ordered correlated events
    links = (
        db.query(IncidentEventLink)
        .filter(IncidentEventLink.incident_id == incident_id)
        .order_by(IncidentEventLink.sequence_order)
        .all()
    )
    event_ids = [l.event_id for l in links]

    events = []
    if event_ids:
        # Preserve sequence order
        events_by_id = {e.id: e for e in db.query(SecurityEventModel).filter(SecurityEventModel.id.in_(event_ids)).all()}
        events = [events_by_id[eid] for eid in event_ids if eid in events_by_id]

    detail_dict = incident.__dict__.copy()
    detail_dict["correlated_events"] = events
    return detail_dict


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: str,
    update: IncidentStatusUpdate,
    db: Session = Depends(get_db)
):
    valid_statuses = ["NEW", "ACKNOWLEDGED", "INVESTIGATING", "RESOLVED"]
    target_status = update.status.upper()
    if target_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    incident = db.query(IncidentModel).filter(IncidentModel.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = target_status
    db.commit()
    db.refresh(incident)
    return incident


@router.post("/analyze", response_model=List[IncidentResponse])
async def trigger_correlation_analysis(
    req: IncidentAnalyzeRequest = IncidentAnalyzeRequest(),
    db: Session = Depends(get_db)
):
    """
    On-demand correlation pipeline:
    Analyzes recent unlinked security events, groups them by temporal and identity graph,
    computes multi-factor risk, and generates prioritized incidents.
    """
    all_events = db.query(SecurityEventModel).all()
    events_data = [
        {
            "id": e.id,
            "timestamp": e.timestamp,
            "source_type": e.source_type,
            "source_name": e.source_name,
            "event_type": e.event_type,
            "user": e.user,
            "device": e.device,
            "ip_address": e.ip_address,
            "location": e.location,
            "resource": e.resource,
            "action": e.action,
            "status": e.status,
            "severity": e.severity,
            "raw_message": e.raw_message,
            "anomaly_score": e.anomaly_score
        }
        for e in all_events
    ]

    clusters = correlation_engine.correlate_events(events_data)
    created_incidents = []

    for cluster in clusters:
        # Check if already correlated to avoid duplicate creation
        cluster_event_ids = [e["id"] for e in cluster["events"]]
        existing_link = db.query(IncidentEventLink).filter(IncidentEventLink.event_id.in_(cluster_event_ids)).first()
        if not existing_link:
            inc = await incident_engine.create_or_update_incident_from_cluster(db, cluster)
            created_incidents.append(inc)

    return db.query(IncidentModel).order_by(desc(IncidentModel.risk_score)).all()
