import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import IncidentModel, IncidentEventLink, SecurityEventModel
from app.services.risk_engine import risk_engine
from app.services.behaviour_engine import behaviour_engine
from app.services.anomaly_engine import anomaly_engine
from app.services.explanation_engine import explanation_engine
from app.services.recommendation_engine import recommendation_engine
from app.utils.helpers import generate_incident_id, get_resource_sensitivity, map_severity_from_score


class IncidentEngine:
    """
    Manages end-to-end incident lifecycle:
    - Synthesizes correlated event clusters into prioritized incidents
    - Calculates multi-factor risk scores
    - Generates XAI explanations and defensive recommendations
    - Persists into DB with relational event links
    - Prioritizes incidents by risk score descending
    """

    @staticmethod
    async def create_or_update_incident_from_cluster(
        db: Session,
        cluster_info: Dict[str, Any]
    ) -> IncidentModel:
        events = cluster_info["events"]
        if not events:
            raise ValueError("Cannot create incident without events")

        # 1. Anomaly component
        anomaly_scores = [float(e.get("anomaly_score", 0.0)) for e in events]
        avg_anomaly = sum(anomaly_scores) / len(anomaly_scores)
        max_anomaly = max(anomaly_scores)
        # Weighted blend of max and avg anomaly
        combined_anomaly = (0.7 * max_anomaly) + (0.3 * avg_anomaly)

        # 2. Correlation score from cluster
        corr_score = float(cluster_info.get("correlation_score", 75.0))

        # 3. Behavioural deviation score
        behaviour_scores = []
        for e in events:
            b_score, _ = behaviour_engine.evaluate_event(e)
            behaviour_scores.append(b_score)
        combined_behaviour = max(behaviour_scores) if behaviour_scores else 50.0

        # 4. Resource sensitivity
        sensitivities = [get_resource_sensitivity(e.get("resource")) for e in events]
        max_sensitivity = max(sensitivities) if sensitivities else 20.0

        # 5. Severity score
        severity_map = {"CRITICAL": 100.0, "HIGH": 75.0, "MEDIUM": 50.0, "LOW": 25.0, "INFO": 10.0}
        sev_scores = [severity_map.get(e.get("severity", "LOW").upper(), 25.0) for e in events]
        max_severity = max(sev_scores) if sev_scores else 25.0

        # Compute 5-factor risk score
        risk_score, severity, factor_breakdown = risk_engine.calculate_risk(
            anomaly_score=combined_anomaly,
            correlation_score=corr_score,
            behaviour_score=combined_behaviour,
            sensitivity_score=max_sensitivity,
            severity_score=max_severity
        )

        attack_pattern = cluster_info.get("attack_pattern", "Potential Coordinated Incident")
        recommendations = recommendation_engine.generate_recommendations(attack_pattern)

        # Generate Explainable AI Reasoning
        explanation = await explanation_engine.generate_explanation(
            incident_title=cluster_info.get("title", "Coordinated Threat Detected"),
            events=events,
            factor_breakdown=factor_breakdown,
            risk_score=risk_score
        )

        # Count existing incidents to create structured ID
        count = db.query(IncidentModel).count() + 1
        incident_id = generate_incident_id(count)

        incident = IncidentModel(
            id=incident_id,
            title=cluster_info.get("title", "Coordinated Threat Detected"),
            description=cluster_info.get("description", "Multi-source event correlation"),
            attack_pattern=attack_pattern,
            risk_score=risk_score,
            severity=severity,
            confidence=cluster_info.get("confidence", 85.0),
            first_seen=cluster_info.get("first_seen", datetime.datetime.utcnow()),
            last_seen=cluster_info.get("last_seen", datetime.datetime.utcnow()),
            affected_users=cluster_info.get("affected_users", []),
            affected_devices=cluster_info.get("affected_devices", []),
            affected_resources=cluster_info.get("affected_resources", []),
            event_count=len(events),
            status="NEW",
            recommended_action=recommendations,
            ai_explanation=explanation,
            factor_breakdown=factor_breakdown
        )

        db.add(incident)
        db.flush()

        # Link events with sequence order
        for idx, evt in enumerate(events):
            evt_id = evt.get("id")
            if evt_id:
                link = IncidentEventLink(
                    incident_id=incident.id,
                    event_id=evt_id,
                    correlation_role="Trigger" if idx == 0 else ("Pivot" if idx < len(events) - 1 else "Action"),
                    sequence_order=idx + 1
                )
                db.add(link)

        db.commit()
        db.refresh(incident)
        return incident

    @staticmethod
    def get_prioritized_incidents(
        db: Session,
        status: Optional[str] = None,
        severity: Optional[str] = None
    ) -> List[IncidentModel]:
        """
        Retrieves all incidents prioritized strictly by risk_score descending.
        """
        query = db.query(IncidentModel)
        if status:
            query = query.filter(IncidentModel.status == status.upper())
        if severity:
            query = query.filter(IncidentModel.severity == severity.upper())

        return query.order_by(IncidentModel.risk_score.desc()).all()


incident_engine = IncidentEngine()
