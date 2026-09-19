import pytest

def test_bookings_list_requires_auth(client):
    res = client.get("/api/bookings")
    assert res.status_code == 401

def test_expenses_requires_auth(client):
    res = client.get("/api/expenses/demo-trip")
    assert res.status_code == 401

def test_expenses_flow_authenticated(client):
    # Register & Login
    reg_resp = client.post("/api/auth/register", json={
        "full_name": "Expense Tester",
        "email": "expense@navora.ai",
        "password": "Password123!"
    })
    token = client.post("/api/auth/login", json={
        "identifier": "expense@navora.ai",
        "password": "Password123!"
    }).json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    
    # List bookings
    bookings_res = client.get("/api/bookings", headers=headers)
    assert bookings_res.status_code == 200
    assert isinstance(bookings_res.json(), list)

    # Get settlements for demo-trip
    settle_res = client.get("/api/expenses/demo-trip/settlement", headers=headers)
    assert settle_res.status_code == 200
    assert isinstance(settle_res.json(), list)
