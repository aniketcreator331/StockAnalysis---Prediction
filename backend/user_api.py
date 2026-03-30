from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any
from database import get_user_data, save_user_data

router = APIRouter()

# ──────── Models ────────

class UserEmail(BaseModel):
    email: str

class UserDataPayload(BaseModel):
    email: str
    followedStocks: List[str] = []
    searchHistory: List[Any] = []
    viewHistory: List[Any] = []
    demoBalance: float = 100000
    demoPortfolio: List[Any] = []

# ──────── Routes ────────

@router.get("/userdata/{email}")
def load_user_data(email: str):
    """Load a user's cloud-synced dashboard data."""
    try:
        data = get_user_data(email)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/userdata")
def store_user_data(payload: UserDataPayload):
    """Save / update a user's cloud-synced dashboard data."""
    try:
        save_user_data(payload.email, payload.dict())
        return {"status": "saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
