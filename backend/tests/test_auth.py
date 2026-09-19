import pytest

def test_register_and_login_flow(client):
    # Register new test user
    reg_payload = {
        "full_name": "Test Traveler",
        "email": "traveler@navora.ai",
        "phone": "+14155552671",
        "password": "Password123!"
    }
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 200
    data = reg_resp.json()
    assert data["status"] == "success"
    demo_otp = data.get("demo_otp_hint")

    # Verify OTP
    if demo_otp:
        verify_resp = client.post("/api/auth/verify-otp", json={
            "identifier": "traveler@navora.ai",
            "code": demo_otp,
            "purpose": "registration"
        })
        assert verify_resp.status_code == 200

    # Login
    login_payload = {
        "identifier": "traveler@navora.ai",
        "password": "Password123!"
    }
    login_resp = client.post("/api/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    token = login_data["access_token"]
    assert login_data["user"]["email"] == "traveler@navora.ai"

    # Get /me profile
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["email"] == "traveler@navora.ai"
