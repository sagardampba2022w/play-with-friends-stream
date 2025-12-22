from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, players

app = FastAPI(
    title="Play with Friends Stream API",
    description="Backend API for Snake Game",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(players.router)

@app.get("/")
async def root():
    return {"message": "Play with Friends Stream API is running"}
