from datetime import datetime, timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db import get_db
from ..models import AuthCredentials, User, UserCreate, UserRead, ApiResponse

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

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: AsyncSession = Depends(get_db)
) -> User:
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
    
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", status_code=status.HTTP_201_CREATED, response_model=ApiResponse)
async def signup(credentials: AuthCredentials, session: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await session.execute(select(User).where(User.email == credentials.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        return {"success": False, "error": "Email already registered"}
    
    if not credentials.username:
         return {"success": False, "error": "Username is required"}

    new_user = User(
        username=credentials.username,
        email=credentials.email,
        password=credentials.password,
        highScore=0,
        createdAt=datetime.now()
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    
    # Return structure matching ApiResponse
    # We transform SQLAlchemy model to Pydantic UserRead manully or via automated conversion if configured.
    # ApiResponse data expects object, but UserRead is a Pydantic model.
    # We can just return new_user and let FastAPI serialization handle it if we typed it correctly, 
    # but ApiResponse data is Optional[object]. 
    # Let's verify serialization.
    
    return {
        "success": True,
        "data": UserRead.model_validate(new_user)
    }

@router.post("/login")
async def login(credentials: AuthCredentials, session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user or user.password != credentials.password:
        return {"success": False, "error": "Invalid credentials"}
    
    access_token = create_access_token(data={"sub": user.email})
    
    # We construct the response. UserRead handles excluding password.
    return {
        "success": True,
        "data": UserRead.model_validate(user),
        "token": access_token
    }

@router.post("/logout")
async def logout(current_user: Annotated[User, Depends(get_current_user)]):
    return {"success": True}

@router.get("/me", response_model=ApiResponse)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return {"success": True, "data": UserRead.model_validate(current_user)}
