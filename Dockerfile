# Stage 1: Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
# Copy dependency definitions
COPY frontend/package.json frontend/package-lock.json ./
# Install dependencies
RUN npm ci
# Copy source code
COPY frontend/ .
# Build
RUN npm run build

# Stage 2: Backend & Final Image
FROM python:3.13-slim

WORKDIR /app

# Enable bytecode compilation
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy backend dependency files
COPY backend/pyproject.toml ./

# Install pip and dependencies with trusted hosts
RUN pip install --no-cache-dir --upgrade pip --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org
RUN pip install --no-cache-dir . --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org

# Copy backend code (including hidden .files if needed, but excluding what's in .dockerignore)
COPY backend/ .

# Copy built frontend assets to a 'static' directory in backend
# backend/static/ will contain index.html and assets/
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose port 8000
EXPOSE 8000

# Run FastAPI app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
