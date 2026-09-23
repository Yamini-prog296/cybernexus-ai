import json
import os
import datetime
from pathlib import Path
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SecurityEventModel, IncidentModel, IncidentEventLink, BehaviourBaselineModel
from app.services.event_normalizer import EventNormalizer
from app.services.anomaly_engine import anomaly_engine
from app.services.correlation_engine import correlation_engine
from app.services.incident_engine import incident_engine
from app.schemas import DemoSimulateRequest

router = APIRouter(prefix="/api/demo", tags=["demo"])

DEMO_FILE_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "demo_events.json"


@router.post("/start")
async def start_demo(db: Session = Depends(get_db)):
    """
    Resets/initializes database with rich synthetic enterprise telemetry.
    Executes complete 10-step CyberNexus AI pipeline:
    Normalization -> Anomaly Detection -> Behavioural Profiling ->
    Correlation -> Risk Calculation -> Incident Creation -> Prioritization -> XAI.
    """
    # 1. Clean existing links & tables
    db.query(IncidentEventLink).delete()
    db.query(IncidentModel).delete()
    db.query(SecurityEventModel).delete()
    db.commit()

    # 2. Ingest demo events from JSON
    if not DEMO_FILE_PATH.exists():
        return {"status": "error", "message": "Demo data file not found"}

    with open(DEMO_FILE_PATH, "r", encoding="utf-8") as f:
        events_json = json.load(f)

    inserted_events = []
    for raw in events_json:
        normalized = EventNormalizer.normalize(raw)
        # Ensure timestamp is datetime
        ts = normalized.get("timestamp")
        if isinstance(ts, str):
            normalized["timestamp"] = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
        # Anomaly scoring
        if not normalized.get("anomaly_score"):
            normalized["anomaly_score"] = anomaly_engine.calculate_anomaly_score(normalized, inserted_events)

        event_record = SecurityEventModel(**normalized)
        db.add(event_record)
        inserted_events.append(normalized)

    db.commit()

    # 3. Trigger correlation engine across all ingested events
    clusters = correlation_engine.correlate_events(inserted_events)
    created_incidents = []

    for cluster in clusters:
        inc = await incident_engine.create_or_update_incident_from_cluster(db, cluster)
        created_incidents.append(inc.id)

    return {
        "status": "success",
        "message": "CYBERNEXUS AI demo state initialized successfully.",
        "events_ingested": len(inserted_events),
        "incidents_created": len(created_incidents),
        "pipeline_stages_completed": [
            "1. Multi-source event ingestion",
            "2. Canonical log normalization",
            "3. Statistical anomaly detection",
            "4. Multi-dimensional graph correlation",
            "5. Behavioural baseline deviation detection",
            "6. 5-factor risk scoring engine",
            "7. Prioritized incident generation",
            "8. Explainable AI reasoning synthesis",
            "9. Defensive response playbook generation"
        ]
    }


@router.post("/simulate")
async def simulate_incident(req: DemoSimulateRequest, db: Session = Depends(get_db)):
    """
    Generates synthetic attack telemetry stream on demand.
    Injects a live multi-stage synthetic attack chain (e.g. Hero Account Compromise).
    """
    user = req.user_target or "alex"
    now = datetime.datetime.utcnow()

    # Create 5 synthetic steps
    synthetic_steps = [
        {
            "source_type": "AUTHENTICATION",
            "source_name": "okta_sso_gateway",
            "event_type": "LOGIN_FAILED",
            "user": user,
            "device": "TERMINAL-SIM-01",
            "ip_address": "198.51.100.20",
            "location": "Bucharest, RO",
            "resource": "sso_portal",
            "action": "AUTH_ATTEMPT",
            "status": "FAILED",
            "severity": "LOW",
            "raw_message": f"user={user} repeated failed password verification from external IP 198.51.100.20",
            "timestamp": now - datetime.timedelta(minutes=8),
            "anomaly_score": 52.0
        },
        {
            "source_type": "AUTHENTICATION",
            "source_name": "okta_sso_gateway",
            "event_type": "LOGIN_SUCCESS",
            "user": user,
            "device": "TERMINAL-SIM-01",
            "ip_address": "198.51.100.20",
            "location": "Bucharest, RO",
            "resource": "sso_portal",
            "action": "SESSION_ESTABLISHED",
            "status": "SUCCESS",
            "severity": "MEDIUM",
            "raw_message": f"user={user} successful authentication from atypical location Bucharest, RO",
            "timestamp": now - datetime.timedelta(minutes=5),
            "anomaly_score": 75.0
        },
        {
            "source_type": "ENDPOINT",
            "source_name": "crowdstrike_agent_55",
            "event_type": "NEW_DEVICE_LOGIN",
            "user": user,
            "device": "ROGUE-PROBE-SIM",
            "ip_address": "198.51.100.20",
            "location": "Bucharest, RO",
            "resource": "workstation_pool",
            "action": "HOST_LOGIN",
            "status": "SUCCESS",
            "severity": "MEDIUM",
            "raw_message": f"user={user} registered unfamiliar device ROGUE-PROBE-SIM",
            "timestamp": now - datetime.timedelta(minutes=3),
            "anomaly_score": 80.0
        },
        {
            "source_type": "ENDPOINT",
            "source_name": "sentinel_file_watcher",
            "event_type": "SENSITIVE_DATA_ACCESS",
            "user": user,
            "device": "ROGUE-PROBE-SIM",
            "ip_address": "198.51.100.20",
            "location": "Bucharest, RO",
            "resource": "customer_financial_records_2026.xlsx",
            "action": "FILE_READ_EXPORT",
            "status": "SUCCESS",
            "severity": "HIGH",
            "raw_message": f"user={user} accessed high-sensitivity asset customer_financial_records_2026.xlsx",
            "timestamp": now - datetime.timedelta(minutes=2),
            "anomaly_score": 89.0
        },
        {
            "source_type": "NETWORK",
            "source_name": "palo_alto_perimeter",
            "event_type": "OUTBOUND_ANOMALY",
            "user": user,
            "device": "ROGUE-PROBE-SIM",
            "ip_address": "198.51.100.20",
            "location": "Bucharest, RO",
            "resource": "external_egress_port_443",
            "action": "DATA_TRANSFER",
            "status": "SUCCESS",
            "severity": "HIGH",
            "raw_message": f"Unusual egress network spike (950MB) to remote IP 192.0.2.10 by user={user}",
            "timestamp": now,
            "anomaly_score": 93.0
        }
    ]

    inserted_records = []
    for step in synthetic_steps:
        normalized = EventNormalizer.normalize(step)
        record = SecurityEventModel(**normalized)
        db.add(record)
        inserted_records.append(normalized)

    db.commit()

    # Correlate this new sequence
    clusters = correlation_engine.correlate_events(inserted_records)
    new_inc = None
    if clusters:
        new_inc = await incident_engine.create_or_update_incident_from_cluster(db, clusters[0])

    return {
        "status": "success",
        "message": f"Simulated 5 synthetic events for {user}",
        "incident_created": new_inc.id if new_inc else None,
        "attack_pattern": new_inc.attack_pattern if new_inc else None,
        "risk_score": new_inc.risk_score if new_inc else None,
        "severity": new_inc.severity if new_inc else None,
        "confidence": new_inc.confidence if new_inc else None
    }
