FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy everything and debug what's available
COPY . .

# List contents to debug
RUN ls -la
RUN ls -la backend/ || echo "backend directory not found"

# Install Python dependencies
RUN if [ -f backend/requirements.txt ]; then pip install --no-cache-dir -r backend/requirements.txt; else echo "requirements.txt not found"; fi

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
