import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Text,
    ForeignKey,
    JSON,
    Index
)
from sqlalchemy.orm import relationship
from app.database import Base


class SecurityEventModel(Base):
    __tablename__ = "security_events"

    id = Column(String(64), primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    source_type = Column(String(32), index=True)  # AUTHENTICATION, NETWORK, ENDPOINT, etc.
    source_name = Column(String(64))
    event_type = Column(String(64), index=True)
    user = Column(String(64), index=True, nullable=True)
    device = Column(String(64), index=True, nullable=True)
    ip_address = Column(String(64), index=True, nullable=True)
    location = Column(String(64), nullable=True)
    resource = Column(String(128), index=True, nullable=True)
    action = Column(String(64), nullable=True)
    status = Column(String(32), default="SUCCESS")  # SUCCESS, FAILED, BLOCKED, etc.
    severity = Column(String(16), default="LOW")    # LOW, MEDIUM, HIGH, CRITICAL, INFO
    raw_message = Column(Text, nullable=True)
    normalized_data = Column(JSON, default=dict)
    anomaly_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    incident_links = relationship("IncidentEventLink", back_populates="event", cascade="all, delete-orphan")


class IncidentModel(Base):
    __tablename__ = "incidents"

    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    attack_pattern = Column(String(128), default="Potential Coordinated Incident")
    risk_score = Column(Float, default=0.0, index=True)
    severity = Column(String(16), default="MEDIUM", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, default=80.0)
    first_seen = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)
    affected_users = Column(JSON, default=list)
    affected_devices = Column(JSON, default=list)
    affected_resources = Column(JSON, default=list)
    event_count = Column(Integer, default=0)
    status = Column(String(32), default="NEW", index=True)  # NEW, ACKNOWLEDGED, INVESTIGATING, RESOLVED
    recommended_action = Column(JSON, default=list)
    ai_explanation = Column(JSON, default=dict)
    factor_breakdown = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    event_links = relationship("IncidentEventLink", back_populates="incident", cascade="all, delete-orphan", order_by="IncidentEventLink.sequence_order")


class IncidentEventLink(Base):
    __tablename__ = "incident_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    incident_id = Column(String(64), ForeignKey("incidents.id", ondelete="CASCADE"), index=True)
    event_id = Column(String(64), ForeignKey("security_events.id", ondelete="CASCADE"), index=True)
    correlation_role = Column(String(64), nullable=True)  # e.g., Trigger, Pivot, Exfiltration
    sequence_order = Column(Integer, default=0)

    # Relationships
    incident = relationship("IncidentModel", back_populates="event_links")
    event = relationship("SecurityEventModel", back_populates="incident_links")


class BehaviourBaselineModel(Base):
    __tablename__ = "behaviour_baselines"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_type = Column(String(32), index=True)  # user, device, ip
    entity_id = Column(String(64), index=True, unique=True)
    typical_hours = Column(JSON, default=list)       # e.g., [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
    known_ips = Column(JSON, default=list)           # list of recognized IPs
    known_devices = Column(JSON, default=list)       # list of recognized devices
    known_locations = Column(JSON, default=list)     # list of recognized locations e.g. ["Chennai, IN"]
    typical_resources = Column(JSON, default=list)   # list of recognized resources
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class SystemMetricModel(Base):
    __tablename__ = "system_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    events_ingested = Column(Integer, default=0)
    anomalies_detected = Column(Integer, default=0)
    active_incidents = Column(Integer, default=0)
    pipeline_latency_ms = Column(Float, default=12.5)
    ai_status = Column(String(32), default="OPERATIONAL")
