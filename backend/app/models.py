from datetime import datetime
from enum import Enum
from typing import List, Optional
import uuid

from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import String, Integer, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base

# --- Enums ---
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

# --- Pydantic Schemas ---

class Position(BaseModel):
    x: int
    y: int

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: str
    highScore: int
    createdAt: datetime

    class Config:
        from_attributes = True

class AuthCredentials(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class LeaderboardSubmission(BaseModel):
    score: int
    mode: GameMode

class LeaderboardEntryRead(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    date: datetime
    rank: Optional[int] = None # Rank is dynamic usually, but can be computed

    class Config:
        from_attributes = True

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

# --- SQLAlchemy Models ---

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password: Mapped[str] = mapped_column(String)
    highScore: Mapped[int] = mapped_column(Integer, default=0)
    createdAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String, index=True) # Intentionally not FK for simplicity/history, or could be FK.
    score: Mapped[int] = mapped_column(Integer)
    mode: Mapped[GameMode] = mapped_column(SAEnum(GameMode))
    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
