FROM python:3.12-slim

WORKDIR /app

# Copy backend files
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY backend/ .

# Set environment
ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# Railway provides PORT environment variable dynamically
# Expose port (Railway will override this with $PORT)
EXPOSE $PORT

# Run the app (will use PORT from environment)
CMD ["python", "app.py"]
