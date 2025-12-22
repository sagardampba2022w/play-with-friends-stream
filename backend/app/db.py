from datetime import datetime
from typing import Dict, List, Optional
from .models import User, LeaderboardEntry, ActivePlayer, GameMode, Position

# Internal user model with password
class UserInDB(User):
    password: str

class MockDatabase:
    def __init__(self):
        self.users: Dict[str, UserInDB] = {}
        self.leaderboard: List[LeaderboardEntry] = []
        self.active_players: List[ActivePlayer] = []
        self._initialize_data()

    def _initialize_data(self):
        # Mock Users
        self.users['player1@test.com'] = UserInDB(
            id='1',
            username='NeonViper',
            email='player1@test.com',
            password='password123',
            highScore=1250,
            createdAt=datetime.fromisoformat('2024-01-15T10:00:00')
        )
        self.users['player2@test.com'] = UserInDB(
            id='2',
            username='CyberSnake',
            email='player2@test.com',
            password='password123',
            highScore=980,
            createdAt=datetime.fromisoformat('2024-02-20T14:30:00')
        )

        # Mock Leaderboard
        self.leaderboard = [
            LeaderboardEntry(id='1', username='NeonViper', score=1250, mode=GameMode.walls, date=datetime.fromisoformat('2024-12-20T15:30:00'), rank=1),
            LeaderboardEntry(id='2', username='PixelMaster', score=1180, mode=GameMode.walls, date=datetime.fromisoformat('2024-12-19T12:00:00'), rank=2),
            LeaderboardEntry(id='3', username='RetroGamer', score=1050, mode=GameMode.pass_through, date=datetime.fromisoformat('2024-12-21T09:15:00'), rank=3),
            LeaderboardEntry(id='4', username='CyberSnake', score=980, mode=GameMode.walls, date=datetime.fromisoformat('2024-12-18T18:45:00'), rank=4),
            LeaderboardEntry(id='5', username='ArcadeKing', score=920, mode=GameMode.pass_through, date=datetime.fromisoformat('2024-12-20T22:00:00'), rank=5),
        ]

        # Mock Active Players
        self.active_players = [
            ActivePlayer(
                id='active-1',
                username='LivePlayer42',
                score=340,
                mode=GameMode.walls,
                snake=[Position(x=10, y=10), Position(x=9, y=10), Position(x=8, y=10)],
                food=Position(x=15, y=12),
                direction='RIGHT',
                status='playing'
            ),
             ActivePlayer(
                id='active-2',
                username='StreamSnake',
                score=520,
                mode=GameMode.pass_through,
                snake=[Position(x=5, y=8), Position(x=5, y=9), Position(x=5, y=10)],
                food=Position(x=12, y=5),
                direction='UP',
                status='playing'
            ),
        ]

    def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        return self.users.get(email)

    def create_user(self, user: UserInDB) -> UserInDB:
        self.users[user.email] = user
        return user

    def add_score(self, entry: LeaderboardEntry):
        self.leaderboard.append(entry)
        # Sort desc by score
        self.leaderboard.sort(key=lambda x: x.score, reverse=True)
        # Re-rank
        for i, item in enumerate(self.leaderboard):
            item.rank = i + 1

    def get_user(self, email: str) -> Optional[UserInDB]:
        return self.users.get(email)

db = MockDatabase()
