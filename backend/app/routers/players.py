from typing import List, Optional
from fastapi import APIRouter
from ..models import ActivePlayer

# In-memory storage for active players (transient state)
# In a production app with multiple workers, this should be Redis.
active_players: List[ActivePlayer] = []

router = APIRouter(prefix="/active-players", tags=["Active Players"])

@router.get("")
async def get_all_active_players():
    return {"success": True, "data": active_players}

@router.get("/{id}")
async def get_active_player(id: str):
    player = next((p for p in active_players if p.id == id), None)
    if not player:
        return {"success": True, "data": None} 
    return {"success": True, "data": player}
