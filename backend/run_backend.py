#!/usr/bin/env python3
"""Script to run backend with error handling"""

import sys
import os
import traceback

def main():
    print("🚀 Starting Asisten Wira Backend...")
    
    try:
        # Test imports
        print("1. Testing imports...")
        from services.ai_service import AIService
        print("✅ AI Service imported successfully")
        
        from main import app
        print("✅ FastAPI app imported successfully")
        
        # Test AI service
        print("2. Testing AI service...")
        ai_service = AIService()
        status = ai_service.get_status()
        print(f"✅ AI Service status: {status}")
        
        print("3. Starting uvicorn server...")
        import uvicorn
        
        # Start server
        uvicorn.run(
            "main:app",
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("Stack trace:")
        traceback.print_exc()
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        print("Stack trace:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
