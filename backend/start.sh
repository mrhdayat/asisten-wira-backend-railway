#!/bin/bash

echo "🚀 Starting Asisten Wira Backend..."

# Activate virtual environment
source venv/bin/activate

# Check if uvicorn is available
if ! command -v uvicorn &> /dev/null; then
    echo "❌ uvicorn not found. Installing..."
    pip install uvicorn
fi

# Start backend
echo "✅ Starting backend on http://localhost:8000"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
