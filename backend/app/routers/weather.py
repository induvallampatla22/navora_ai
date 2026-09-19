from fastapi import APIRouter, Query
from app.providers.weather_provider import weather_provider
from app.schemas.intelligence import WeatherOut

router = APIRouter(prefix="/api/weather", tags=["Travel Intelligence & Weather"])


@router.get("", response_model=WeatherOut)
def get_destination_weather(
    destination: str = Query(..., description="Target destination (e.g. Goa, Kashmir, Tokyo, Paris)")
):
    weather_data = weather_provider.get_weather(destination)
    return WeatherOut(**weather_data)
