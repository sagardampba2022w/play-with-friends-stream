from typing import Optional
from fastapi import APIRouter
from ..db import db

router = APIRouter(prefix="/active-players", tags=["Active Players"])

@router.get("")
async def get_all_active_players():
    return {"success": True, "data": db.active_players}

@router.get("/{id}")
async def get_active_player(id: str):
    player = next((p for p in db.active_players if p.id == id), None)
    if not player:
        # Returning success: true but data: null as per typical robust API design or 404
        # api.ts `getActivePlayerById` returns `undefined` if not found but success=true.
        return {"success": True, "data": None} 
    return {"success": True, "data": player}
