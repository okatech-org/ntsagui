# Cortex NLP - NEOCORTEX Linguistic Processing
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/

# Environment variables
ENV PYTHONPATH=/app
ENV KAFKA_BOOTSTRAP_SERVERS=redpanda:29092
ENV REDIS_URL=redis://redis:6379
ENV LLM_API_URL=https://ai.gateway.lovable.dev/v1/chat/completions

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8001/health')" || exit 1

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001"]
