import pytest

def test_list_destinations(client):
    response = client.get("/api/destinations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first = data[0]
    assert "id" in first
    assert "name" in first
    assert "slug" in first

def test_search_destinations(client):
    response = client.get("/api/destinations?search=Tokyo")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_destination_detail(client):
    # First get list to find a slug
    list_resp = client.get("/api/destinations")
    slug = list_resp.json()[0]["slug"]

    detail_resp = client.get(f"/api/destinations/{slug}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["slug"] == slug
    assert "name" in detail
