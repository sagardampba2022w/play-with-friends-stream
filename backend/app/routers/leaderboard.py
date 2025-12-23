from datetime import datetime
from typing import Annotated, Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import LeaderboardEntry, LeaderboardEntryRead, LeaderboardSubmission, GameMode, User, ApiResponse
from .auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=ApiResponse)
async def get_leaderboard(
    mode: Optional[GameMode] = None,
    session: AsyncSession = Depends(get_db)
):
    query = select(LeaderboardEntry).order_by(desc(LeaderboardEntry.score))
    
    if mode:
        query = query.where(LeaderboardEntry.mode == mode)
        
    result = await session.execute(query)
    entries = result.scalars().all()
    
    # Calculate rank dynamically
    data = []
    for index, entry in enumerate(entries):
        # Convert to Pydantic model with rank
        # We process manually to add rank
        entry_read = LeaderboardEntryRead(
            id=entry.id,
            username=entry.username,
            score=entry.score,
            mode=entry.mode,
            date=entry.date,
            rank=index + 1
        )
        data.append(entry_read)
    
    return {"success": True, "data": data}

@router.post("", status_code=201, response_model=ApiResponse)
async def submit_score(
    submission: LeaderboardSubmission,
    current_user: Annotated[User, Depends(get_current_user)],
    session: AsyncSession = Depends(get_db)
):
    # Update high score if applicable
    # current_user is already attached to session from get_current_user? 
    # Actually get_current_user fetches user from DB, so it's fresh. 
    # But it might be detached if session closed in get_current_user?
    # get_current_user logic: `result = await session.execute(...)` then returns user. 
    # If `session` is dependency, it closes after request. 
    # But `get_current_user` uses `Depends(get_db)`. 
    # FastAPI handles shared dependencies: if `get_leaderboard` (or submit_score) also asks for `get_db`, 
    # they get the SAME session object if it's the same dependency call in the same request scope.
    # So `current_user` should be attached.
    
    if submission.score > current_user.highScore:
        current_user.highScore = submission.score
        session.add(current_user) # Mark as dirty
    
    new_entry = LeaderboardEntry(
        username=current_user.username,
        score=submission.score,
        mode=submission.mode,
        date=datetime.now()
    )
    
    session.add(new_entry)
    await session.commit()
    await session.refresh(new_entry)
    
    # Calculate rank for the new entry
    # Efficient info: Count how many have higher score
    # simple approach: just count
    stmt = select(LeaderboardEntry).where(LeaderboardEntry.score > new_entry.score)
    if new_entry.mode:
         stmt = stmt.where(LeaderboardEntry.mode == new_entry.mode)
    
    # Actually rank is global per mode usually.
    # If mode is not saved in backend logic for rank I should consistently use it.
    # The get_leaderboard filters by mode.
    # Let's count all with higher score in Same Mode (or globally if mode is None? submission has mode).
    
    count_stmt = select(LeaderboardEntry).where(LeaderboardEntry.score > new_entry.score)
    if new_entry.mode:
        count_stmt = count_stmt.where(LeaderboardEntry.mode == new_entry.mode)
        
    result = await session.execute(count_stmt)
    better_scores_count = len(result.scalars().all()) # Optimization: select(func.count)...
    
    # Construct response
    response_entry = LeaderboardEntryRead(
        id=new_entry.id,
        username=new_entry.username,
        score=new_entry.score,
        mode=new_entry.mode,
        date=new_entry.date,
        rank=better_scores_count + 1
    )
    
    return {"success": True, "data": response_entry}
