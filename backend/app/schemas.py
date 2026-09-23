from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SecurityEventBase(BaseModel):
    source_type: str = Field(..., description="AUTHENTICATION, NETWORK, ENDPOINT, APPLICATION, DATABASE, FIREWALL, CLOUD")
    source_name: Optional[str] = "generic_sensor"
    event_type: str = Field(..., description="LOGIN_FAILED, SENSITIVE_DATA_ACCESS, OUTBOUND_ANOMALY, etc.")
    user: Optional[str] = None
    device: Optional[str] = None
    ip_address: Optional[str] = None
    location: Optional[str] = None
    resource: Optional[str] = None
    action: Optional[str] = None
    status: Optional[str] = "SUCCESS"
    severity: Optional[str] = "LOW"
    raw_message: Optional[str] = None
    normalized_data: Optional[Dict[str, Any]] = None
    anomaly_score: Optional[float] = 0.0


class SecurityEventCreate(SecurityEventBase):
    id: Optional[str] = None
    timestamp: Optional[datetime] = None


class SecurityEventResponse(SecurityEventBase):
    id: str
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class IncidentStatusUpdate(BaseModel):
    status: str = Field(..., description="NEW, ACKNOWLEDGED, INVESTIGATING, RESOLVED")


class IncidentBase(BaseModel):
    id: str
    title: str
    description: str
    attack_pattern: str
    risk_score: float
    severity: str
    confidence: float
    first_seen: datetime
    last_seen: datetime
    affected_users: List[str] = []
    affected_devices: List[str] = []
    affected_resources: List[str] = []
    event_count: int = 0
    status: str = "NEW"
    recommended_action: List[str] = []
    ai_explanation: Dict[str, Any] = {}
    factor_breakdown: Dict[str, Any] = {}


class IncidentResponse(IncidentBase):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IncidentDetailResponse(IncidentResponse):
    correlated_events: List[SecurityEventResponse] = []


class IncidentAnalyzeRequest(BaseModel):
    time_window_minutes: Optional[int] = 60
    min_risk_threshold: Optional[float] = 25.0


class DashboardStats(BaseModel):
    total_events: int
    active_incidents: int
    critical_incidents: int
    high_risk_incidents: int
    anomalies_detected: int
    affected_users_count: int
    system_status: str = "OPERATIONAL"
    ai_provider: str = "LOCAL"
    average_risk_score: float


class AnalyticsSummary(BaseModel):
    events_by_source: Dict[str, int]
    events_over_time: List[Dict[str, Any]]
    risk_distribution: Dict[str, int]
    incidents_by_severity: Dict[str, int]
    top_anomalous_users: List[Dict[str, Any]]
    top_affected_resources: List[Dict[str, Any]]
    anomaly_categories: Dict[str, int]
    average_risk_score: float


class HealthResponse(BaseModel):
    status: str = "healthy"
    soc_system: str = "OPERATIONAL"
    ai_provider: str
    database: str
    version: str = "1.0.0"
    timestamp: datetime


class DemoSimulateRequest(BaseModel):
    scenario: Optional[str] = "account_compromise"
    user_target: Optional[str] = "alex"
