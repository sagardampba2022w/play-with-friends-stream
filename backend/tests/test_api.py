def test_read_main(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Play with Friends Stream API is running"}

def test_auth_signup_login_flow(client):
    # Signup
    signup_data = {
        "email": "newuser@test.com",
        "username": "NewTester",
        "password": "testpassword"
    }
    response = client.post("/auth/signup", json=signup_data)
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
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "token" in data
    token = data["token"]

    # Get Me
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "newuser@test.com"

def test_leaderboard(client):
    # Get standard
    response = client.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 5 # We initialized with 5

    # Filter
    response = client.get("/leaderboard?mode=walls")
    assert response.status_code == 200
    data = response.json()
    assert all(item["mode"] == "walls" for item in data["data"])

    # Submit Score (needs auth)
    # Login first to get token
    login_data = {
        "email": "player1@test.com", # Existing mocked user
        "password": "password123"
    }
    response = client.post("/auth/login", json=login_data)
    token = response.json()["token"]

    submit_data = {
        "score": 9999,
        "mode": "walls"
    }
    response = client.post("/leaderboard", json=submit_data, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["score"] == 9999
    
    # Verify leaderboard updated
    response = client.get("/leaderboard")
    best_score = max(item["score"] for item in response.json()["data"])
    assert best_score == 9999

def test_active_players(client):
    response = client.get("/active-players")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) > 0

    player_id = data["data"][0]["id"]
    response = client.get(f"/active-players/{player_id}")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["id"] == player_id
