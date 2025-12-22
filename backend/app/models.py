from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class GameMode(str, Enum):
    pass_through = 'pass-through'
    walls = 'walls'

class Direction(str, Enum):
    UP = 'UP'
    DOWN = 'DOWN'
    LEFT = 'LEFT'
    RIGHT = 'RIGHT'

class GameStatus(str, Enum):
    idle = 'idle'
    playing = 'playing'
    paused = 'paused'
    game_over = 'game-over'

class Position(BaseModel):
    x: int
    y: int

class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    highScore: int
    createdAt: datetime

class AuthCredentials(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class LeaderboardEntry(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    date: datetime
    rank: int

class LeaderboardSubmission(BaseModel):
    score: int
    mode: GameMode

class ActivePlayer(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    snake: List[Position]
    food: Position
    direction: Direction
    status: GameStatus

class ApiResponse(BaseModel):
    success: bool
    data: Optional[object] = None
    error: Optional[str] = None
