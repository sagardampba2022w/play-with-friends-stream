# 🐍 Play with Friends Stream

A modern, full-stack multiplayer Snake game with real-time leaderboards and spectator mode. Built with React, TypeScript, and FastAPI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.13+-blue.svg)
![Node](https://img.shields.io/badge/node-20+-green.svg)

## 🎮 Features

### Game Modes
- **Walls Mode**: Classic snake gameplay with collision boundaries
- **Pass-Through Mode**: Snake can wrap around screen edges

### Core Features
- 🎯 Real-time multiplayer leaderboards
- 👥 User authentication and profiles
- 👀 Watch other players in real-time
- 📊 Score tracking and rankings
- 🎨 Modern, responsive UI with dark mode
- 🔄 Live game state updates

## 🏗️ Architecture

### Tech Stack

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Routing**: React Router
- **HTTP Client**: Fetch API
- **Testing**: Vitest

#### Backend
- **Framework**: FastAPI (Python 3.13)
- **Database**: PostgreSQL (Production) / SQLite (Development)
- **ORM**: SQLAlchemy with async support
- **Authentication**: JWT tokens
- **Testing**: pytest + pytest-asyncio
- **Package Manager**: uv

#### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (production)
- **CI/CD**: GitHub Actions
- **Deployment**: Render
- **Database**: Render PostgreSQL

### Project Structure

```
play-with-friends-stream/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── package.json
│
├── backend/                # FastAPI backend application
│   ├── app/
│   │   ├── main.py        # Application entry point
│   │   ├── models.py      # Database models
│   │   ├── db.py          # Database configuration
│   │   └── routers/       # API endpoints
│   │       ├── auth.py    # Authentication routes
│   │       ├── leaderboard.py
│   │       └── players.py
│   ├── tests/             # Unit tests
│   ├── tests_integration/ # Integration tests
│   ├── Makefile          # Development commands
│   └── pyproject.toml    # Python dependencies
│
├── .github/
│   └── workflows/
│       └── ci.yml         # CI/CD pipeline
├── docker-compose.yml     # Local development setup
├── Dockerfile            # Multi-stage production build
└── render.yaml           # Render deployment config
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.13+
- **uv** (Python package manager)
- **Docker** and Docker Compose (optional, for containerized development)

### Option 1: Local Development (Separated Services)

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### Backend Setup

```bash
cd backend
uv sync
make dev
```

The backend API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

### Option 2: Docker Development

Run both frontend and backend with a single command:

```bash
docker-compose up
```

Services:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm test              # Run tests once
npm test -- --watch   # Run tests in watch mode
```

**Test Coverage**: 37 tests across API services and game hooks

### Backend Tests

```bash
cd backend

# Run all tests
make test

# Run only unit tests
make test-unit

# Run only integration tests
make test-integration
```

**Test Coverage**:
- Unit tests: 4 tests
- Integration tests: 1 test
- Total: 5 tests

## 📦 Deployment

### Automated Deployment (CI/CD)

The project uses GitHub Actions for continuous deployment:

1. **Push to main branch** triggers the CI/CD pipeline
2. **Three test jobs run in parallel**:
   - Frontend tests (37 tests)
   - Backend unit tests (4 tests)
   - Backend integration tests (1 test)
3. **Deploy to Render** (only if all tests pass)

### Manual Deployment to Render

Follow the detailed guide in [DEPLOYMENT.md](./DEPLOYMENT.md)

Key steps:
1. Create Render Web Service
2. Set up PostgreSQL database
3. Configure environment variables
4. Connect GitHub repository
5. Deploy!

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Leaderboard
- `GET /api/leaderboard?mode=walls|pass-through` - Get leaderboard
- `POST /api/leaderboard` - Submit score

### Active Players
- `GET /api/active-players` - Get all active players
- `GET /api/active-players/{id}` - Get specific player

## 🔧 Development Commands

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm test            # Run tests
npm run lint        # Run ESLint
```

### Backend
```bash
make install        # Install dependencies
make dev           # Start dev server with auto-reload
make start         # Start production server
make test          # Run all tests
make test-unit     # Run unit tests only
make test-integration  # Run integration tests only
make clean         # Remove cache files
```

### Docker
```bash
docker-compose up          # Start all services
docker-compose up -d       # Start in detached mode
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

1. All PRs must pass CI tests
2. Code must follow existing style guidelines
3. Update tests for new features
4. Update documentation as needed

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Deployed on [Render](https://render.com/)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation in `/docs`
- Review the [DEPLOYMENT.md](./DEPLOYMENT.md) guide

---

Made with ❤️ using React, TypeScript, and FastAPI
