import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application Settings
    app_name: str = "Asisten Wira API"
    environment: str = "development"
    debug: bool = True
    port: int = 8000
    
    # Supabase Configuration
    supabase_url: str = os.getenv("SUPABASE_URL", "your_supabase_url_here")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "your_supabase_anon_key_here")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "your_supabase_service_role_key_here")
    
    # IBM Orchestrate Configuration
    ibm_orchestrate_api_key: str = os.getenv("IBM_ORCHESTRATE_API_KEY", "your_ibm_orchestrate_api_key_here")
    ibm_orchestrate_base_url: str = os.getenv("IBM_ORCHESTRATE_BASE_URL", "your_ibm_orchestrate_base_url_here")
    
    # Hugging Face Configuration
    huggingface_api_token: str = os.getenv("HUGGINGFACE_API_TOKEN", "your_huggingface_api_token_here")
    
    # Replicate Configuration
    replicate_api_token: str = os.getenv("REPLICATE_API_TOKEN", "your_replicate_api_token_here")
    
    # Security
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-this")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "https://asisten-wira.vercel.app"
    ]
    
    # File Upload
    max_upload_size: int = 10 * 1024 * 1024  # 10MB
    allowed_file_types: List[str] = ["pdf", "txt", "csv", "docx"]
    
    # AI Models Configuration
    default_llm_model: str = "openai/gpt-oss-20b"  # More generative model for general questions
    fallback_llm_model: str = "google/flan-t5-base"  # Fallback for specific tasks
    hoax_detection_model: str = "indobenchmark/indobert-base-p2"
    sentiment_analysis_model: str = "indobenchmark/indobert-base-p2"
    
    # Additional models for different use cases
    general_chat_model: str = "openai/gpt-oss-20b"  # For general conversations
    business_chat_model: str = "google/flan-t5-base"  # For business-specific questions
    
    class Config:
        env_file = ".env"

settings = Settings()
