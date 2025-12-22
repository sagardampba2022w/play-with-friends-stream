from datetime import datetime, timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import BaseModel

from ..db import db, UserInDB
from ..models import AuthCredentials, User, ApiResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = "mock-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(credentials: AuthCredentials):
    if db.get_user_by_email(credentials.email):
        return {"success": False, "error": "Email already registered"}
        # Note: OpenAPI spec says 400 for error, but consistency with frontend requires careful response structure. 
        # Using 201 for success, but effectively handling error scenarios.
    
    if not credentials.username:
         return {"success": False, "error": "Username is required"}

    new_user = UserInDB(
        id=f"user-{datetime.now().timestamp()}",
        username=credentials.username,
        email=credentials.email,
        password=credentials.password,
        highScore=0,
        createdAt=datetime.now()
    )
    db.create_user(new_user)
    
    # Return structure matching ApiResponse<User>
    return {
        "success": True,
        "data": new_user
    }

@router.post("/login")
async def login(credentials: AuthCredentials):
    user = db.get_user_by_email(credentials.email)
    if not user or user.password != credentials.password:
        return {"success": False, "error": "Invalid credentials"} # Frontend expects this or 401? Spec says 401 but frontend code might expect success: false
        # Adjusting to match probable frontend expectation of 200 OK with success: false for invalid creds based on typical fetch usage, 
        # or actually strictly following REST where 401 is appropriate. 
        # However, looking at api.ts: `return { success: false, error: 'Invalid password' };`
        # This implies the HTTP call succeeds (200) but returns a payload indicating failure.
    
    access_token = create_access_token(data={"sub": user.email})
    return {
        "success": True,
        "data": user,
        "token": access_token
    }

@router.post("/logout")
async def logout(current_user: Annotated[User, Depends(get_current_user)]):
    return {"success": True}

@router.get("/me")
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return {"success": True, "data": current_user}
