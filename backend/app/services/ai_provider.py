import os
import json
from typing import Dict, Any, Optional
import httpx


class AIProvider:
    """
    Hybrid AI Provider supporting:
    1. LOCAL (Deterministic, rule-based & statistical XAI - NO API keys required)
    2. GEMINI (Google Gemini via REST API)
    3. OPENAI_COMPATIBLE (OpenAI or local Ollama / vLLM endpoint)

    Always falls back gracefully to LOCAL mode if keys are missing or requests fail.
    """

    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "local").lower()
        self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.openai_base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        self.model_name = os.getenv("MODEL_NAME", "gemini-1.5-flash")

    def get_active_provider_name(self) -> str:
        if self.provider == "gemini" and self.gemini_api_key:
            return "GEMINI (Active)"
        elif self.provider == "openai" and self.openai_api_key:
            return "OPENAI_COMPATIBLE (Active)"
        return "LOCAL AI (Deterministic)"

    async def generate_explanation(
        self,
        incident_title: str,
        events: list,
        factors: Dict[str, Any],
        risk_score: float
    ) -> Dict[str, Any]:
        """
        Generates Explainable AI reasoning.
        If local mode or API fails, uses local rule-based explanation engine.
        """
        if self.provider == "gemini" and self.gemini_api_key:
            try:
                gemini_res = await self._call_gemini(incident_title, events, factors, risk_score)
                if gemini_res:
                    return gemini_res
            except Exception as e:
                # Log and fallback silently to local
                pass

        elif self.provider == "openai" and self.openai_api_key:
            try:
                openai_res = await self._call_openai(incident_title, events, factors, risk_score)
                if openai_res:
                    return openai_res
            except Exception as e:
                pass

        # Fallback to high-fidelity LOCAL mode
        return self._local_explanation(incident_title, events, factors, risk_score)

    def _local_explanation(
        self,
        incident_title: str,
        events: list,
        factors: Dict[str, Any],
        risk_score: float
    ) -> Dict[str, Any]:
        bullets = []
        auth_failures = sum(1 for e in events if getattr(e, "event_type", "") == "LOGIN_FAILED")
        if auth_failures > 0:
            bullets.append(f"+ {auth_failures} repeated authentication failure(s) detected prior to access")

        has_unusual_login = any(getattr(e, "event_type", "") in ["UNUSUAL_LOGIN", "LOGIN_SUCCESS"] and getattr(e, "location", "") != "Chennai, IN" for e in events)
        if has_unusual_login:
            bullets.append("+ successful login from anomalous geographic location or atypical time")

        has_new_device = any("new_device" in getattr(e, "event_type", "").lower() or "device" in str(getattr(e, "raw_message", "")).lower() for e in events)
        if has_new_device:
            bullets.append("+ unfamiliar hardware device fingerprint unrecognized in baseline")

        has_sensitive_access = any("sensitive" in getattr(e, "event_type", "").lower() or getattr(e, "resource", "") for e in events if "customer" in str(getattr(e, "resource", "")).lower() or "db" in str(getattr(e, "resource", "")).lower() or "secret" in str(getattr(e, "resource", "")).lower())
        if has_sensitive_access:
            bullets.append("+ direct access to high-value enterprise asset / database")

        has_outbound = any("outbound" in getattr(e, "event_type", "").lower() or "traffic" in getattr(e, "event_type", "").lower() for e in events)
        if has_outbound:
            bullets.append("+ abnormal egress network telemetry and anomalous external session")

        # Time proximity check
        if len(events) >= 2:
            first_ts = min(getattr(e, "timestamp", None) or 0 for e in events)
            last_ts = max(getattr(e, "timestamp", None) or 0 for e in events)
            if hasattr(first_ts, "timestamp") and hasattr(last_ts, "timestamp"):
                diff_min = max(1, int((last_ts.timestamp() - first_ts.timestamp()) / 60))
                bullets.append(f"+ all coordinated events occurred within an intense {diff_min}-minute temporal window")
            else:
                bullets.append("+ multiple related events occurred within rapid temporal proximity")

        if not bullets:
            bullets.append("+ correlated multi-source event sequence deviates from regular operational baseline")

        return {
            "summary": f"Potential coordinated attack pattern detected across {len(events)} correlated events from multiple enterprise log streams.",
            "why_flagged": bullets,
            "correlation_strength": "Strong" if factors.get("correlation", 0) >= 60 else "Moderate",
            "behavioural_deviation": "High" if factors.get("behaviour", 0) >= 60 else "Moderate",
            "resource_sensitivity": "High" if factors.get("sensitivity", 0) >= 60 else "Standard",
            "final_risk": round(risk_score, 1),
            "confidence": 91.0 if risk_score >= 80 else 82.0,
            "engine_mode": "LOCAL_XAI"
        }

    async def _call_gemini(self, title, events, factors, risk_score) -> Optional[Dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.gemini_api_key}"
        prompt = f"You are CyberNexus AI XAI Engine. Explain why this incident was flagged:\nTitle: {title}\nRisk: {risk_score}\nEvents: {[getattr(e, 'event_type', '') for e in events]}\nProvide JSON with fields: summary, why_flagged (list of strings starting with '+ '), correlation_strength, behavioural_deviation, resource_sensitivity, confidence."
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                # Parse markdown backticks if any
                clean_text = text.replace("```json", "").replace("```", "").strip()
                data = json.loads(clean_text)
                data["engine_mode"] = "GEMINI_AI"
                return data
        return None

    async def _call_openai(self, title, events, factors, risk_score) -> Optional[Dict[str, Any]]:
        url = f"{self.openai_base_url}/chat/completions"
        headers = {"Authorization": f"Bearer {self.openai_api_key}", "Content-Type": "application/json"}
        prompt = f"Explain why this incident was flagged in JSON format: Title: {title}, Risk: {risk_score}, Events: {[getattr(e, 'event_type', '') for e in events]}"
        payload = {
            "model": self.model_name or "gpt-4o-mini",
            "messages": [{"role": "system", "content": "You are a SOC XAI engine. Return JSON with summary, why_flagged, correlation_strength, behavioural_deviation, resource_sensitivity, confidence."}, {"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        }
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = json.loads(resp.json()["choices"][0]["message"]["content"])
                data["engine_mode"] = "OPENAI_COMPATIBLE"
                return data
        return None


ai_provider = AIProvider()
