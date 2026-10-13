"""
Travel Provider: Uses Gemini AI to generate real, route-specific transport options.
Falls back to structured demo data if Gemini is unavailable.
"""
import json
import logging
import re
from typing import List, Dict, Any

from app.config import settings

logger = logging.getLogger("navora.providers.travel")


class MultiModalTravelProvider:
    def __init__(self):
        self.gemini_api_key = settings.GEMINI_API_KEY

    def search_transport(
        self,
        origin: str,
        destination: str,
        date: str = "2026-10-15",
        excluded_modes: List[str] = None
    ) -> List[Dict[str, Any]]:
        excluded = [m.lower().strip() for m in (excluded_modes or [])]

        # Try Gemini for dynamic, route-specific options
        if self.gemini_api_key:
            try:
                options = self._gemini_transport_options(origin, destination, date)
                if options:
                    return [o for o in options if o["mode"].lower() not in excluded]
            except Exception as e:
                logger.warning(f"Gemini transport generation failed: {e}")

        # Fallback: structured demo data with correct origin/destination
        return self._demo_options(origin, destination, excluded)

    def _gemini_transport_options(self, origin: str, destination: str, date: str) -> List[Dict[str, Any]]:
        """Ask Gemini to generate realistic transport options for this specific route."""
        import httpx

        prompt = f"""You are a travel assistant. Generate realistic transport options from {origin} to {destination} for Indian travelers on {date}.

Return ONLY a valid JSON array (no markdown, no explanation) with 3-4 options covering different modes (Train, Bus, Flight if applicable).
Each object must have exactly these fields:
{{
  "mode": "Train|Bus|Flight|Cab",
  "provider_name": "real or realistic Indian provider name",
  "departure_time": "HH:MM AM/PM format",
  "arrival_time": "HH:MM AM/PM format",
  "duration_minutes": integer,
  "price": realistic INR price as number,
  "currency": "INR",
  "comfort_rating": 4.0-5.0,
  "cancellation_policy": "short policy string",
  "budget_impact": "Low|Balanced|High"
}}

Use realistic Indian train names (Rajdhani, Shatabdi, Intercity, etc.), bus operators (APSRTC, TSRTC, RedBus, etc.), and airlines (IndiGo, Air India, SpiceJet) where relevant for {origin} to {destination}."""

        models = ["gemini-3.1-flash-lite", "gemini-flash-lite-latest", "gemini-flash-latest"]
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1024}
        }

        raw = None
        for m in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={self.gemini_api_key}"
            try:
                resp = httpx.post(url, json=payload, timeout=15)
                if resp.status_code == 200:
                    raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
                    break
            except Exception:
                continue

        if not raw:
            raise RuntimeError("All Gemini models failed for transport options")

        # Strip markdown code blocks if present
        raw = re.sub(r"```json\s*|\s*```", "", raw).strip()
        options = json.loads(raw)

        # Normalise and tag each option
        result = []
        for idx, opt in enumerate(options):
            result.append({
                "id": f"trans-{opt.get('mode','').lower()}-{idx}",
                "origin": origin,
                "destination": destination,
                "mode": opt.get("mode", "Train"),
                "provider_name": opt.get("provider_name", "Unknown"),
                "departure_time": opt.get("departure_time", "08:00 AM"),
                "arrival_time": opt.get("arrival_time", "12:00 PM"),
                "duration_minutes": int(opt.get("duration_minutes", 240)),
                "transfers": 0,
                "price": float(opt.get("price", 500)),
                "currency": opt.get("currency", "INR"),
                "comfort_rating": float(opt.get("comfort_rating", 4.3)),
                "cancellation_policy": opt.get("cancellation_policy", "Standard"),
                "preference_match": 90.0,
                "budget_impact": opt.get("budget_impact", "Balanced"),
                "co2_emissions_kg": 0.0,
                "is_demo_data": False
            })
        return result

    def _demo_options(self, origin: str, destination: str, excluded: List[str]) -> List[Dict[str, Any]]:
        """Structured fallback with correct origin/destination injected."""
        all_opts = [
            {
                "id": "trans-train-1",
                "origin": origin, "destination": destination,
                "mode": "Train", "provider_name": "Rajdhani / Shatabdi Express",
                "departure_time": "07:30 AM", "arrival_time": "12:15 PM",
                "duration_minutes": 285, "transfers": 0,
                "price": 850, "currency": "INR",
                "comfort_rating": 4.8,
                "cancellation_policy": "Full refund up to 4h before departure",
                "preference_match": 95.0, "budget_impact": "Balanced",
                "co2_emissions_kg": 24.0, "is_demo_data": True
            },
            {
                "id": "trans-bus-1",
                "origin": origin, "destination": destination,
                "mode": "Bus", "provider_name": "APSRTC / TSRTC Sleeper",
                "departure_time": "10:00 PM (Overnight)", "arrival_time": "06:30 AM",
                "duration_minutes": 510, "transfers": 0,
                "price": 450, "currency": "INR",
                "comfort_rating": 4.2,
                "cancellation_policy": "Free cancellation up to 12h before",
                "preference_match": 78.0, "budget_impact": "Low",
                "co2_emissions_kg": 18.0, "is_demo_data": True
            },
            {
                "id": "trans-flight-1",
                "origin": origin, "destination": destination,
                "mode": "Flight", "provider_name": "IndiGo / SpiceJet",
                "departure_time": "08:15 AM", "arrival_time": "09:45 AM",
                "duration_minutes": 90, "transfers": 0,
                "price": 3200, "currency": "INR",
                "comfort_rating": 4.5,
                "cancellation_policy": "Refundable with fee up to 24h prior",
                "preference_match": 88.0, "budget_impact": "High",
                "co2_emissions_kg": 115.0, "is_demo_data": True
            },
        ]
        return [o for o in all_opts if o["mode"].lower() not in excluded]


travel_provider = MultiModalTravelProvider()
