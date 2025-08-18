#!/usr/bin/env python3
"""Simple server script to run FastAPI app"""

import uvicorn

if __name__ == "__main__":
    print("🚀 Starting Asisten Wira Backend...")
    print("📍 Server will run on http://localhost:8000")
    print("📱 Frontend can connect to http://localhost:8000/chat")
    
    # Run server with import string for reload to work
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
