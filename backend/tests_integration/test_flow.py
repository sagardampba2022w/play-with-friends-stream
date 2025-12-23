import pytest

@pytest.mark.asyncio
async def test_full_user_journey(client):
    """
    Test a complete user journey:
    1. Register User A
    2. Register User B
    3. User A posts a high score
    4. User B posts a lower score
    5. Verify Leaderboard (A is rank 1, B is rank 2)
    6. User B improves score to beat A
    7. Verify Leaderboard (B is rank 1, A is rank 2)
    """

    # 1. Register User A
    user_a = {
        "email": "alice@example.com",
        "username": "AliceWrapper",
        "password": "password123"
    }
    res = await client.post("/auth/signup", json=user_a)
    assert res.status_code == 201
    assert res.json()["success"] is True

    # Login User A
    res = await client.post("/auth/login", json={"email": user_a["email"], "password": user_a["password"]})
    token_a = res.json()["token"]

    # 2. Register User B
    user_b = {
        "email": "bob@example.com",
        "username": "BobBuilder",
        "password": "password123"
    }
    res = await client.post("/auth/signup", json=user_b)
    assert res.status_code == 201

    # Login User B
    res = await client.post("/auth/login", json={"email": user_b["email"], "password": user_b["password"]})
    token_b = res.json()["token"]

    # 3. User A posts score (Score: 100)
    res = await client.post(
        "/leaderboard", 
        json={"score": 100, "mode": "walls"},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert res.status_code == 201
    assert res.json()["data"]["rank"] == 1

    # 4. User B posts lower score (Score: 50)
    res = await client.post(
        "/leaderboard", 
        json={"score": 50, "mode": "walls"},
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res.status_code == 201
    # Check rank immediately
    # Assuming standard competition ranking or dense ranking. 
    # If A is 100, B is 50. B should be rank 2.
    assert res.json()["data"]["rank"] == 2

    # 5. Verify Leaderboard
    res = await client.get("/leaderboard?mode=walls")
    leaderboard = res.json()["data"]
    assert len(leaderboard) >= 2
    assert leaderboard[0]["username"] == "AliceWrapper"
    assert leaderboard[0]["score"] == 100
    assert leaderboard[1]["username"] == "BobBuilder"
    assert leaderboard[1]["score"] == 50

    # 6. User B improves score (Score: 200)
    res = await client.post(
        "/leaderboard", 
        json={"score": 200, "mode": "walls"},
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert res.status_code == 201
    # B should now be rank 1
    assert res.json()["data"]["rank"] == 1

    # 7. Verify Leaderboard again
    res = await client.get("/leaderboard?mode=walls")
    leaderboard = res.json()["data"]
    assert leaderboard[0]["username"] == "BobBuilder"
    assert leaderboard[0]["score"] == 200
    assert leaderboard[1]["username"] == "AliceWrapper"
    assert leaderboard[1]["score"] == 100
