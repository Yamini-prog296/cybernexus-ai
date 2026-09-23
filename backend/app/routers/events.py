from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.database import get_db
from app.models import SecurityEventModel
from app.schemas import SecurityEventResponse, SecurityEventCreate
from app.services.event_normalizer import EventNormalizer
from app.services.anomaly_engine import anomaly_engine

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=List[SecurityEventResponse])
def list_events(
    source_type: Optional[str] = Query(None, description="Filter by source type"),
    severity: Optional[str] = Query(None, description="Filter by severity level"),
    user: Optional[str] = Query(None, description="Filter by user"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    search: Optional[str] = Query(None, description="Search raw message or identifiers"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(SecurityEventModel)

    if source_type:
        query = query.filter(SecurityEventModel.source_type == source_type.upper())
    if severity:
        query = query.filter(SecurityEventModel.severity == severity.upper())
    if user:
        query = query.filter(SecurityEventModel.user.ilike(f"%{user}%"))
    if event_type:
        query = query.filter(SecurityEventModel.event_type == event_type.upper())
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                SecurityEventModel.raw_message.ilike(search_fmt),
                SecurityEventModel.user.ilike(search_fmt),
                SecurityEventModel.ip_address.ilike(search_fmt),
                SecurityEventModel.resource.ilike(search_fmt),
                SecurityEventModel.id.ilike(search_fmt)
            )
        )

    return query.order_by(desc(SecurityEventModel.timestamp)).offset(offset).limit(limit).all()


@router.post("", response_model=SecurityEventResponse, status_code=status.HTTP_201_CREATED)
def ingest_event(event_in: SecurityEventCreate, db: Session = Depends(get_db)):
    # Normalize event
    normalized = EventNormalizer.normalize(event_in.model_dump())

    # Calculate anomaly score if not provided
    if not normalized.get("anomaly_score"):
        # Fetch recent user events for context
        recent = db.query(SecurityEventModel).filter(SecurityEventModel.user == normalized.get("user")).order_by(desc(SecurityEventModel.timestamp)).limit(20).all()
        recent_dicts = [{"event_type": r.event_type, "status": r.status, "user": r.user} for r in recent]
        normalized["anomaly_score"] = anomaly_engine.calculate_anomaly_score(normalized, recent_dicts)

    event_record = SecurityEventModel(**normalized)
    db.add(event_record)
    db.commit()
    db.refresh(event_record)
    return event_record


@router.get("/{event_id}", response_model=SecurityEventResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    evt = db.query(SecurityEventModel).filter(SecurityEventModel.id == event_id).first()
    if not evt:
        raise HTTPException(status_code=404, detail="Security event not found")
    return evt
