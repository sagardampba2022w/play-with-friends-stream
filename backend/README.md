# Backend Service

This is the backend for the "Play with Friends Stream" application, built with FastAPI.

## Prerequisites

- Python 3.13+
- [uv](https://github.com/astral-sh/uv) (for dependency management)

## Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Sync dependencies:
    ```bash
    uv sync
    ```

## Running the Server

To start the development server with auto-reload:

```bash
uv run uvicorn app.main:app --reload
```

The server will start at `http://localhost:8000`.

- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Running Tests

To run the automated tests:

```bash
uv run pytest
```
