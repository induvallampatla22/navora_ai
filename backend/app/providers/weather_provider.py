from datetime import datetime
import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings
from app.providers.base import BaseWeatherProvider

logger = logging.getLogger("navora.providers.weather")


class OpenWeatherProvider(BaseWeatherProvider):
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.is_active = bool(self.api_key and not settings.DEMO_MODE)

    def get_weather(self, destination: str, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
        if self.is_active:
            try:
                # Try OpenWeather API call
                url = f"https://api.openweathermap.org/data/2.5/weather?q={destination}&appid={self.api_key}&units=metric"
                res = httpx.get(url, timeout=5.0)
                if res.status_code == 200:
                    data = res.json()
                    temp = data.get("main", {}).get("temp", 24.0)
                    desc = data.get("weather", [{}])[0].get("main", "Clear")
                    return {
                        "destination_name": destination,
                        "temperature_c": float(temp),
                        "condition": desc,
                        "humidity_pct": data.get("main", {}).get("humidity", 60),
                        "wind_kmh": round(data.get("wind", {}).get("speed", 3.0) * 3.6, 1),
                        "rain_chance_pct": 15 if "Rain" in desc else 5,
                        "risk_level": "Moderate" if "Thunderstorm" in desc or "Storm" in desc else "Low",
                        "risk_advisory": "Possible precipitation detected. Prepare umbrella and light waterproofs." if "Rain" in desc else "Optimal travel conditions.",
                        "forecast": self._generate_forecast_days(temp, desc),
                        "source": "OpenWeatherMap Live Telemetry",
                        "is_demo_data": False,
                        "timestamp": datetime.utcnow().isoformat()
                    }
            except Exception as e:
                logger.warning(f"Error querying live weather provider: {e}. Falling back to demo data.")

        # Clearly marked DEMO DATA provider
        return self._generate_demo_weather(destination)

    def _generate_demo_weather(self, destination: str) -> Dict[str, Any]:
        # Generates realistic seasonal climate baseline
        d_lower = destination.lower()
        if "kashmir" in d_lower or "alps" in d_lower:
            base_temp = 14.0
            cond = "Crisp Mountain Breeze"
            rain = 10
            risk = "Low"
            advisory = "Mountain chill in mornings and evenings. Warm layers advised."
        elif "goa" in d_lower or "bali" in d_lower:
            base_temp = 29.0
            cond = "Coastal Sunshine"
            rain = 20
            risk = "Low"
            advisory = "Pleasant coastal warmth. High UV index around midday."
        elif "kerala" in d_lower:
            base_temp = 27.0
            cond = "Tropical Greenery & Mild Clouds"
            rain = 35
            risk = "Low"
            advisory = "Light tropical showers likely in the late afternoon."
        elif "tokyo" in d_lower:
            base_temp = 18.0
            cond = "Clear & Mild"
            rain = 15
            risk = "Low"
            advisory = "Ideal urban exploration weather."
        else:
            base_temp = 25.0
            cond = "Sunny & Pleasant"
            rain = 10
            risk = "Low"
            advisory = "Good travel conditions throughout the destination."

        return {
            "destination_name": destination,
            "temperature_c": base_temp,
            "condition": cond,
            "humidity_pct": 65,
            "wind_kmh": 14.0,
            "rain_chance_pct": rain,
            "risk_level": risk,
            "risk_advisory": advisory,
            "forecast": self._generate_forecast_days(base_temp, cond),
            "source": "NAVORA Travel Intelligence Weather Sandbox (DEMO DATA)",
            "is_demo_data": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    def _generate_forecast_days(self, base_temp: float, main_cond: str):
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        return [
            {
                "day": day,
                "temp_high_c": round(base_temp + (i % 3) * 1.5, 1),
                "temp_low_c": round(base_temp - 4.0 - (i % 2), 1),
                "condition": main_cond,
                "icon": "sun" if i % 2 == 0 else "cloud-sun",
                "rain_chance_pct": (10 * i) % 40
            }
            for i, day in enumerate(days)
        ]


weather_provider = OpenWeatherProvider()
