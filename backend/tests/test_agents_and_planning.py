import pytest
from app.agents.orchestrator import orchestrator

def test_orchestrator_chat_multilingual(db_session):
    # Test English query
    res_en = orchestrator.process_multilingual_chat(
        query="Recommend top vegetarian restaurants in Goa",
        db=db_session,
        language="en",
        trip_context={"primary_destination": "Goa", "trip_id": "test-123"}
    )
    assert res_en["response"] is not None
    assert "RestaurantAgent" in res_en["agents_involved"]
    assert "dining" in res_en["structured_data"]

    # Test Telugu query
    res_te = orchestrator.process_multilingual_chat(
        query="Goa lo varsham padutundi, trip delay ayithe em cheyyali?",
        db=db_session,
        language="te",
        trip_context={"primary_destination": "Goa", "trip_id": "test-123"}
    )
    assert res_te["response"] is not None
    assert any(a in res_te["agents_involved"] for a in ["WeatherRiskAgent", "TripMonitoringAgent", "ReplanningAgent"])

def test_orchestrator_emergency(db_session):
    res_sos = orchestrator.process_multilingual_chat(
        query="Where is the nearest hospital or police station in Goa?",
        db=db_session,
        language="en",
        trip_context={"primary_destination": "Goa"}
    )
    assert "SafetyAgent" in res_sos["agents_involved"]
    assert "safety" in res_sos["structured_data"]
