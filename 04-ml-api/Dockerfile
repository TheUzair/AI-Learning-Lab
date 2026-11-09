# 1. Base Image: Use official lightweight Debian-based Python 3.11
FROM python:3.11-slim

# 2. Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# 3. Set container working directory
WORKDIR /app

# 4. Install uv by copying the standalone binary directly from Astral's official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 5. Copy project configuration files first (for optimal Docker layer caching)
COPY pyproject.toml uv.lock ./

# 6. Install production dependencies only (exclude dev tools like pytest)
RUN uv sync --frozen --no-dev

# 7. Copy application source code and model weights
COPY src/ ./src/
COPY model/ ./model/

# 8. Expose application port
EXPOSE 8000

# 9. Start the FastAPI application with Uvicorn
# Uses ${PORT:-8000} so it works locally AND supports dynamic cloud ports (like Render)
CMD ["sh", "-c", "uv run uvicorn ml_api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]