from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import logging
import uvicorn
from services.supabase_service import supabase_service
# Use lightweight AI service for Railway deployment
try:
    from services.ai_service_railway import AIServiceRailway
    ai_service = AIServiceRailway()
    print("Using lightweight AI service for Railway deployment")
except ImportError:
    from services.ai_service import ai_service
    print("Using full AI service with local ML packages")
from services.auth_service import get_current_user_id, get_current_user_info

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Asisten Wira API",
    description="AI Chatbot Builder API untuk UMKM Indonesia",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://asisten-wira.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Pydantic models
class ChatbotCreate(BaseModel):
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None

class ChatbotResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    industry: Optional[str]
    created_at: str
    knowledge_base_size: int
    deployment_url: Optional[str]

class KnowledgeBaseItem(BaseModel):
    content: str
    source: Optional[str] = None
    category: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    chatbot_id: str

class ChatResponse(BaseModel):
    response: str
    confidence: float
    sentiment: Optional[str] = None
    is_hoax_detected: Optional[bool] = None

class HoaxAnalysis(BaseModel):
    text: str
    is_hoax: bool
    confidence: float
    explanation: str

class SentimentAnalysis(BaseModel):
    text: str
    sentiment: str  # positive, negative, neutral
    confidence: float
    emotions: Dict[str, float]

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.get("/")
async def root():
    return {
        "message": "Asisten Wira API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "asisten-wira-api"}

@app.get("/ai/status")
async def get_ai_status():
    """Get AI services status and configuration"""
    return ai_service.get_status()

# Authentication endpoints
@app.post("/auth/register")
async def register_user(
    email: str, 
    password: str, 
    full_name: str,
    business_name: Optional[str] = None,
    industry: Optional[str] = None
):
    """Register new user"""
    try:
        metadata = {
            "full_name": full_name,
            "business_name": business_name,
            "industry": industry
        }
        
        result = await supabase_service.create_user(email, password, metadata)
        
        if result["success"]:
            return {
                "message": "User registered successfully",
                "user": result["user"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=400, detail="Registration failed")

@app.post("/auth/login")
async def login_user(email: str, password: str):
    """Authenticate user and return JWT token"""
    try:
        result = await supabase_service.authenticate_user(email, password)
        
        if result["success"]:
            return {
                "access_token": result["session"]["access_token"],
                "token_type": "bearer",
                "user": result["user"],
                "expires_at": result["session"]["expires_at"]
            }
        else:
            raise HTTPException(status_code=401, detail=result["error"])
            
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

# Chatbot management endpoints
@app.post("/chatbots", response_model=ChatbotResponse)
async def create_chatbot(
    chatbot: ChatbotCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new chatbot"""
    try:
        chatbot_data = {
            "name": chatbot.name,
            "description": chatbot.description,
            "industry": chatbot.industry
        }
        
        result = await supabase_service.create_chatbot(user_id, chatbot_data)
        
        if result["success"]:
            data = result["data"]
            return ChatbotResponse(
                id=data["id"],
                name=data["name"],
                description=data["description"],
                industry=data["industry"],
                created_at=data["created_at"],
                knowledge_base_size=data["knowledge_base_size"],
                deployment_url=data.get("deployment_url")
            )
        else:
            raise HTTPException(status_code=400, detail=result["error"])
            
    except Exception as e:
        logger.error(f"Chatbot creation error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to create chatbot")

@app.get("/chatbots", response_model=List[ChatbotResponse])
async def get_user_chatbots(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get all chatbots for authenticated user"""
    try:
        # TODO: Implement fetching user chatbots from Supabase
        return []
    except Exception as e:
        logger.error(f"Error fetching chatbots: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to fetch chatbots")

@app.get("/chatbots/{chatbot_id}", response_model=ChatbotResponse)
async def get_chatbot(
    chatbot_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get specific chatbot details"""
    try:
        # TODO: Implement fetching specific chatbot from Supabase
        return ChatbotResponse(
            id=chatbot_id,
            name="Sample Chatbot",
            description="Sample description",
            industry="Retail",
            created_at="2024-01-01T00:00:00Z",
            knowledge_base_size=10,
            deployment_url="https://example.com/chatbot/embed.js"
        )
    except Exception as e:
        logger.error(f"Error fetching chatbot: {str(e)}")
        raise HTTPException(status_code=404, detail="Chatbot not found")

# Knowledge base management
@app.post("/chatbots/{chatbot_id}/knowledge")
async def add_knowledge_base_item(
    chatbot_id: str,
    item: KnowledgeBaseItem,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Add item to chatbot knowledge base"""
    try:
        # TODO: Implement knowledge base storage with vector embeddings
        return {"message": "Knowledge base item added successfully"}
    except Exception as e:
        logger.error(f"Error adding knowledge base item: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to add knowledge base item")

@app.post("/chatbots/{chatbot_id}/knowledge/upload")
async def upload_knowledge_file(
    chatbot_id: str,
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Upload file to chatbot knowledge base"""
    try:
        # TODO: Implement file processing and knowledge extraction
        content = await file.read()
        return {
            "message": "File uploaded and processed successfully",
            "filename": file.filename,
            "size": len(content)
        }
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to upload file")

# Chat endpoints
@app.post("/chat", response_model=ChatResponse)
async def chat_with_bot(message: ChatMessage):
    """Send message to chatbot and get response"""
    try:
        # Get chatbot context from knowledge base
        knowledge_items = await supabase_service.get_knowledge_base(message.chatbot_id)
        context = ""
        if knowledge_items["success"] and knowledge_items["data"]:
            # Use first few items as context (in production, use vector search)
            context_items = knowledge_items["data"][:3]
            context = "\n".join([item["content"] for item in context_items])
        
        # Generate AI response
        ai_response = await ai_service.generate_chat_response(
            message.message, 
            context, 
            message.chatbot_id
        )
        
        # Analyze sentiment
        sentiment_result = await ai_service.analyze_sentiment(message.message)
        
        # Check for hoax (if message contains links or suspicious claims)
        hoax_result = None
        if "http" in message.message.lower() or any(word in message.message.lower() for word in ["gratis", "menang", "jutaan"]):
            hoax_result = await ai_service.detect_hoax(message.message)
        
        # Log conversation
        conversation_metadata = {
            "sentiment": sentiment_result.get("sentiment"),
            "confidence": ai_response.get("confidence"),
            "is_hoax_detected": hoax_result.get("is_hoax") if hoax_result else False
        }
        
        await supabase_service.log_conversation(
            message.chatbot_id,
            message.message,
            ai_response["response"],
            conversation_metadata
        )
        
        return ChatResponse(
            response=ai_response["response"],
            confidence=ai_response.get("confidence", 0.7),
            sentiment=sentiment_result.get("sentiment"),
            is_hoax_detected=hoax_result.get("is_hoax") if hoax_result else False
        )
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return ChatResponse(
            response="Maaf, terjadi kesalahan sistem. Silakan coba lagi.",
            confidence=0.0,
            sentiment="neutral",
            is_hoax_detected=False
        )

# AI Analysis endpoints
@app.post("/ai/hoax-detection", response_model=HoaxAnalysis)
async def detect_hoax(text: str):
    """Analyze text for hoax/misinformation"""
    try:
        result = await ai_service.detect_hoax(text)
        
        return HoaxAnalysis(
            text=text,
            is_hoax=result.get("is_hoax", False),
            confidence=result.get("confidence", 0.0),
            explanation=result.get("explanation", "Tidak dapat menganalisis teks")
        )
    except Exception as e:
        logger.error(f"Hoax detection error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to analyze text for hoax")

@app.post("/ai/sentiment-analysis", response_model=SentimentAnalysis)
async def analyze_sentiment(text: str):
    """Analyze text sentiment"""
    try:
        result = await ai_service.analyze_sentiment(text)
        
        return SentimentAnalysis(
            text=text,
            sentiment=result.get("sentiment", "neutral"),
            confidence=result.get("confidence", 0.0),
            emotions=result.get("emotions", {})
        )
    except Exception as e:
        logger.error(f"Sentiment analysis error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to analyze sentiment")

# Analytics endpoints
@app.get("/chatbots/{chatbot_id}/analytics")
async def get_chatbot_analytics(
    chatbot_id: str,
    days: int = 30,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get chatbot usage analytics"""
    try:
        # TODO: Implement analytics from database
        return {
            "total_conversations": 150,
            "total_messages": 1250,
            "avg_response_time": 0.85,
            "sentiment_distribution": {
                "positive": 65,
                "neutral": 25,
                "negative": 10
            },
            "top_intents": [
                {"intent": "product_inquiry", "count": 45},
                {"intent": "pricing", "count": 32},
                {"intent": "support", "count": 28}
            ],
            "daily_stats": []  # TODO: Generate daily statistics
        }
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to fetch analytics")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
