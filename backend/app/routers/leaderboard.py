from datetime import datetime
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException
from ..db import db
from ..models import LeaderboardEntry, LeaderboardSubmission, GameMode, User
from .auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("")
async def get_leaderboard(mode: Optional[GameMode] = None):
    # Filter by mode if provided
    entries = db.leaderboard
    if mode:
        entries = [e for e in entries if e.mode == mode]
    
    return {"success": True, "data": entries}

@router.post("", status_code=201)
async def submit_score(
    submission: LeaderboardSubmission,
    current_user: Annotated[User, Depends(get_current_user)]
):
    # Update high score if applicable
    user_in_db = db.get_user_by_email(current_user.email)
    if submission.score > user_in_db.highScore:
        user_in_db.highScore = submission.score
    
    new_entry = LeaderboardEntry(
        id=f"score-{datetime.now().timestamp()}",
        username=current_user.username,
        score=submission.score,
        mode=submission.mode,
        date=datetime.now(),
        rank=0 # Will be recalculated
    )
    
    db.add_score(new_entry)
    
    # Get the updated entry with rank
    # simple finding by id
    added_entry = next((e for e in db.leaderboard if e.id == new_entry.id), new_entry)
    
    return {"success": True, "data": added_entry}
