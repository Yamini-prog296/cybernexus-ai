from typing import List, Dict, Any
from app.services.ai_provider import ai_provider


class ExplanationEngine:
    """
    Produces transparent, auditable Explainable AI (XAI) justifications
    for why an alert was prioritized.
    """

    @staticmethod
    async def generate_explanation(
        incident_title: str,
        events: List[Any],
        factor_breakdown: Dict[str, Any],
        risk_score: float
    ) -> Dict[str, Any]:
        """
        Coordinates with AIProvider (Local XAI or Optional Cloud LLM)
        to generate transparent reasoning.
        """
        factors = {
            "correlation": factor_breakdown.get("components", {}).get("correlation_score", 70.0),
            "behaviour": factor_breakdown.get("components", {}).get("behaviour_score", 75.0),
            "sensitivity": factor_breakdown.get("components", {}).get("sensitivity_score", 80.0),
            "anomaly": factor_breakdown.get("components", {}).get("anomaly_score", 75.0)
        }

        explanation = await ai_provider.generate_explanation(
            incident_title=incident_title,
            events=events,
            factors=factors,
            risk_score=risk_score
        )

        return explanation


explanation_engine = ExplanationEngine()
