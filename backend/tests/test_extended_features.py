import datetime
import pytest
from app.models.catalog import Destination
from app.models.trip import Trip, TripMember, Itinerary, ItineraryItem
from app.models.commerce import Booking


def test_safety_and_emergency(client, auth_headers):
    # Public safety lookup
    res = client.get("/api/safety?destination=Goa")
    assert res.status_code == 200
    data = res.json()
    assert "safety_score" in data or "overall" in data or "emergency_numbers" in data

    # SOS trigger
    sos_res = client.post(
        "/api/safety/sos",
        headers=auth_headers,
        json={"emergency_type": "medical", "latitude": 15.2993, "longitude": 74.1240}
    )
    assert sos_res.status_code == 200
    assert sos_res.json()["status"] == "alert_dispatched"


def test_smart_packing_flow(client, auth_headers, test_user, db_session):
    # Create test trip
    trip = Trip(
        creator_id=test_user.id,
        title="Goa Beach Vacation",
        primary_destination="Goa",
        start_date=datetime.datetime.utcnow(),
        end_date=datetime.datetime.utcnow() + datetime.timedelta(days=5),
        total_budget=1500.0
    )
    db_session.add(trip)
    db_session.commit()
    db_session.refresh(trip)

    # Get packing list
    res = client.get(f"/api/packing/{trip.id}", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_items"] > 0
    assert len(data["categories"]) > 0

    first_item_id = data["categories"][0]["items"][0]["id"]

    # Toggle item
    tog_res = client.post(
        f"/api/packing/{trip.id}/toggle",
        headers=auth_headers,
        json={"item_id": first_item_id}
    )
    assert tog_res.status_code == 200
    assert tog_res.json()["status"] == "success"

    # Add custom item
    add_res = client.post(
        f"/api/packing/{trip.id}/add",
        headers=auth_headers,
        json={"item_name": "Snorkel Goggles", "category": "Gear", "is_essential": True}
    )
    assert add_res.status_code == 200
    assert add_res.json()["item"]["text"] == "Snorkel Goggles"


def test_document_vault(client, auth_headers):
    # List documents
    res = client.get("/api/documents", headers=auth_headers)
    assert res.status_code == 200
    docs = res.json()
    assert len(docs) > 0

    # Upload new document
    upload_res = client.post(
        "/api/documents",
        headers=auth_headers,
        json={
            "title": "Flight Ticket E-Pass",
            "doc_type": "ticket",
            "file_path": "/vault/ticket_123.pdf",
            "file_size_kb": 180
        }
    )
    assert upload_res.status_code == 200
    new_doc_id = upload_res.json()["id"]

    # Delete document
    del_res = client.delete(f"/api/documents/{new_doc_id}", headers=auth_headers)
    assert del_res.status_code == 200


def test_community_and_reviews(client, auth_headers):
    # List community posts
    res = client.get("/api/community/posts")
    assert res.status_code == 200
    posts = res.json()
    assert len(posts) > 0

    # Create new post
    create_res = client.post(
        "/api/community/posts",
        headers=auth_headers,
        json={
            "title": "Sunrise Yoga on Palolem Beach",
            "destination_name": "Goa",
            "content": "Peaceful morning waves and fresh coconut water. Truly rejuvenating experience.",
            "tags": ["Goa", "Wellness", "Yoga"]
        }
    )
    assert create_res.status_code == 200
    post_id = create_res.json()["post_id"]

    # Like post
    like_res = client.post(f"/api/community/posts/{post_id}/like", headers=auth_headers)
    assert like_res.status_code == 200
    assert like_res.json()["likes"] >= 1

    # List reviews
    rev_res = client.get("/api/reviews")
    assert rev_res.status_code == 200
    assert len(rev_res.json()) > 0


def test_notifications_flow(client, auth_headers):
    res = client.get("/api/notifications", headers=auth_headers)
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) > 0

    notif_id = notifs[0]["id"]
    read_res = client.post(f"/api/notifications/{notif_id}/read", headers=auth_headers)
    assert read_res.status_code == 200

    read_all_res = client.post("/api/notifications/read-all", headers=auth_headers)
    assert read_all_res.status_code == 200


def test_coins_wallet_and_redemption(client, auth_headers):
    res = client.get("/api/coins/wallet", headers=auth_headers)
    assert res.status_code == 200
    wallet = res.json()
    assert wallet["balance"] >= 100  # From welcome bonus

    # Redeem 50 coins
    redeem_res = client.post(
        "/api/coins/redeem",
        headers=auth_headers,
        json={"amount": 50, "purpose": "travel_discount"}
    )
    assert redeem_res.status_code == 200
    data = redeem_res.json()
    assert data["success"] is True
    assert "voucher_code" in data
