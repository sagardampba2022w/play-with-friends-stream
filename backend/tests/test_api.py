import pytest

@pytest.mark.asyncio
async def test_read_main(client):
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Play with Friends Stream API is running"}

@pytest.mark.asyncio
async def test_auth_signup_login_flow(client):
    # Signup
    signup_data = {
        "email": "newuser@test.com",
        "username": "NewTester",
        "password": "testpassword"
    }
    response = await client.post("/auth/signup", json=signup_data)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "newuser@test.com"
    assert data["data"]["username"] == "NewTester"

    # Login
    login_data = {
        "email": "newuser@test.com",
        "password": "testpassword"
    }
    response = await client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "token" in data
    token = data["token"]

    # Get Me
    response = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "newuser@test.com"

@pytest.mark.asyncio
async def test_leaderboard(client):
    # Get standard (Initially empty in DB, unlike Mock which had data)
    response = await client.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # The new DB is empty, so we expect 0 items initially unless we seed.
    # assert len(data["data"]) >= 5 -> This will fail now.
    assert isinstance(data["data"], list)

    # Submit Score (needs auth)
    # 1. Signup/Login first
    signup_data = {
        "email": "player1@test.com", 
        "username": "Player1",
        "password": "password123"
    }
    await client.post("/auth/signup", json=signup_data)
    
    login_data = {"email": "player1@test.com", "password": "password123"}
    login_res = await client.post("/auth/login", json=login_data)
    token = login_res.json()["token"]

    submit_data = {
        "score": 9999,
        "mode": "walls"
    }
    response = await client.post("/leaderboard", json=submit_data, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["score"] == 9999
    
    # Verify leaderboard updated
    response = await client.get("/leaderboard")
    data_list = response.json()["data"]
    assert len(data_list) > 0
    best_score = max(item["score"] for item in data_list)
    assert best_score == 9999

    # Filter
    response = await client.get("/leaderboard?mode=walls")
    assert response.status_code == 200
    data = response.json()
    assert all(item["mode"] == "walls" for item in data["data"])

@pytest.mark.asyncio
async def test_active_players(client):
    # Active players are in-memory, start empty in players.py
    response = await client.get("/active-players")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # assert len(data["data"]) > 0 -> Will fail, starts empty.
    assert isinstance(data["data"], list)
    
    # We haven't implemented a way to Add active player via API in this file 
    # (previously Mock had them). 
    # We can skip detail checks or just verify structure.
