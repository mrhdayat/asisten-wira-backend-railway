#!/usr/bin/env python3
"""Debug import issues"""

print("Testing imports step by step...")

try:
    print("1. Testing config import...")
    from config import settings
    print("✅ Config imported successfully")
except Exception as e:
    print(f"❌ Config import failed: {e}")

try:
    print("2. Testing replicate client import...")
    from ai_models.replicate_client import ReplicateClient
    print("✅ ReplicateClient imported successfully")
except Exception as e:
    print(f"❌ ReplicateClient import failed: {e}")

try:
    print("3. Testing huggingface client import...")
    from ai_models.huggingface_client import HuggingFaceClient
    print("✅ HuggingFaceClient imported successfully")
except Exception as e:
    print(f"❌ HuggingFaceClient import failed: {e}")

try:
    print("4. Testing IBM client import...")
    from ai_models.ibm_watsonx_client import IBMWatsonXClient
    print("✅ IBMWatsonXClient imported successfully")
except Exception as e:
    print(f"❌ IBMWatsonXClient import failed: {e}")

print("Import test completed.")
