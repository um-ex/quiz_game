# Use official Python image
FROM python:3.11-slim

WORKDIR /app

# Copy backend files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose backend port
EXPOSE 5000
# Run the app
CMD ["python", "app.py"]
