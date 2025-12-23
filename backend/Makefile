.PHONY: install dev start test clean lint format

# Install dependencies using uv
install:
	uv sync

# Run development server with hot reload
dev:
	uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run production server
start:
	uv run uvicorn app.main:app --host 0.0.0.0 --port 8000

# Run tests
test:
	PYTHONPATH=. uv run pytest

# Run only unit tests
test-unit:
	PYTHONPATH=. uv run pytest tests/

# Run only integration tests
test-integration:
	PYTHONPATH=. uv run pytest tests_integration/

# Clean up cache files
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
