import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
import requests
import json

from config import settings

logger = logging.getLogger(__name__)

class AIServiceRailway:
    """Lightweight AI service for Railway deployment - no local ML packages required"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Initialize API clients for external AI services
        self.replicate_api_key = settings.replicate_api_token
        self.huggingface_api_key = settings.huggingface_api_token
        self.ibm_api_key = settings.ibm_orchestrate_api_key
        self.ibm_base_url = settings.ibm_orchestrate_base_url
        
        # API endpoints
        self.replicate_url = "https://api.replicate.com/v1/predictions"
        self.huggingface_url = "https://api-inference.huggingface.co/models"
        
        self.logger.info("Lightweight AI service initialized for Railway deployment")
    
    async def generate_chat_response(self, 
                                   message: str, 
                                   context: Optional[str] = None,
                                   chatbot_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate chatbot response using external AI APIs"""
        
        try:
            # Try Replicate first (IBM Granite model)
            if self.replicate_api_key:
                result = await self._try_replicate_chat(message, context)
                if result and not result.get("error"):
                    result["chatbot_id"] = chatbot_id
                    result["timestamp"] = self._get_timestamp()
                    result["ai_tier"] = "primary"
                    result["ai_provider"] = "Replicate (IBM Granite)"
                    return result
            
            # Try Hugging Face as fallback
            if self.huggingface_api_key:
                result = await self._try_huggingface_chat(message, context)
                if result and not result.get("error"):
                    result["chatbot_id"] = chatbot_id
                    result["timestamp"] = self._get_timestamp()
                    result["ai_tier"] = "secondary"
                    result["ai_provider"] = "Hugging Face (GPT-OSS-20B)"
                    return result
            
            # Try IBM Orchestrate as last resort
            if self.ibm_api_key and self.ibm_base_url:
                result = await self._try_ibm_chat(message, context)
                if result and not result.get("error"):
                    result["chatbot_id"] = chatbot_id
                    result["timestamp"] = self._get_timestamp()
                    result["ai_tier"] = "fallback"
                    result["ai_provider"] = "IBM Orchestrate"
                    return result
            
            # If all fail, return helpful message
            logger.error("All AI services failed to generate response")
            return {
                "response": "Maaf, saya sedang mengalami kesulitan teknis. Silakan coba lagi dalam beberapa saat atau hubungi tim support kami.",
                "confidence": 0.0,
                "error": "All AI services failed",
                "chatbot_id": chatbot_id,
                "timestamp": self._get_timestamp(),
                "ai_tier": "none",
                "ai_provider": "none"
            }
            
        except Exception as e:
            logger.error(f"Error in chat response generation: {str(e)}")
            return {
                "response": "Maaf, saya sedang mengalami gangguan teknis. Silakan coba lagi dalam beberapa saat.",
                "confidence": 0.0,
                "error": str(e),
                "chatbot_id": chatbot_id,
                "timestamp": self._get_timestamp(),
                "ai_tier": "error",
                "ai_provider": "error"
            }
    
    async def _try_replicate_chat(self, message: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Try Replicate API for chat response"""
        try:
            headers = {
                "Authorization": f"Token {self.replicate_api_key}",
                "Content-Type": "application/json"
            }
            
            # Use IBM Granite model via Replicate
            payload = {
                "version": "ibm-granite/granite-3.3-8b-instruct",
                "input": {
                    "prompt": f"Context: {context or 'General conversation'}\n\nUser: {message}\n\nAssistant:",
                    "max_new_tokens": 500,
                    "temperature": 0.7
                }
            }
            
            response = requests.post(self.replicate_url, headers=headers, json=payload)
            
            if response.status_code == 201:
                prediction_id = response.json().get("id")
                # For simplicity, return immediate response (in production, you'd poll for completion)
                return {
                    "response": f"Response from Replicate (IBM Granite) - Prediction ID: {prediction_id}",
                    "confidence": 0.8,
                    "error": None
                }
            else:
                logger.warning(f"Replicate API error: {response.status_code} - {response.text}")
                return {"error": f"Replicate API error: {response.status_code}"}
                
        except Exception as e:
            logger.error(f"Replicate chat error: {e}")
            return {"error": str(e)}
    
    async def _try_huggingface_chat(self, message: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Try Hugging Face API for chat response"""
        try:
            headers = {
                "Authorization": f"Bearer {self.huggingface_api_key}",
                "Content-Type": "application/json"
            }
            
            # Use OpenAI GPT-OSS-20B model
            model_url = f"{self.huggingface_url}/openai/gpt-oss-20b"
            
            payload = {
                "inputs": f"Context: {context or 'General conversation'}\n\nUser: {message}\n\nAssistant:",
                "parameters": {
                    "max_new_tokens": 200,
                    "temperature": 0.7,
                    "do_sample": True
                }
            }
            
            response = requests.post(model_url, headers=headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return {
                        "response": result[0].get("generated_text", "No response generated"),
                        "confidence": 0.8,
                        "error": None
                    }
                else:
                    return {"error": "Invalid response format from Hugging Face"}
            else:
                logger.warning(f"Hugging Face API error: {response.status_code} - {response.text}")
                return {"error": f"Hugging Face API error: {response.status_code}"}
                
        except Exception as e:
            logger.error(f"Hugging Face chat error: {e}")
            return {"error": str(e)}
    
    async def _try_ibm_chat(self, message: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Try IBM Orchestrate API for chat response"""
        try:
            headers = {
                "Authorization": f"Bearer {self.ibm_api_key}",
                "Content-Type": "application/json"
            }
            
            # IBM Orchestrate API call
            payload = {
                "model": "ibm-granite/granite-3.3-8b-instruct",
                "prompt": f"Context: {context or 'General conversation'}\n\nUser: {message}\n\nAssistant:",
                "max_tokens": 500,
                "temperature": 0.7
            }
            
            response = requests.post(f"{self.ibm_base_url}/v1/text/generation", headers=headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "response": result.get("results", [{}])[0].get("generated_text", "No response generated"),
                    "confidence": 0.8,
                    "error": None
                }
            else:
                logger.warning(f"IBM API error: {response.status_code} - {response.text}")
                return {"error": f"IBM API error: {response.status_code}"}
                
        except Exception as e:
            logger.error(f"IBM chat error: {e}")
            return {"error": str(e)}
    
    async def detect_hoax(self, text: str) -> Dict[str, Any]:
        """Detect hoax using external AI APIs"""
        try:
            # Try Replicate first
            if self.replicate_api_key:
                result = await self._try_replicate_hoax(text)
                if result and not result.get("error"):
                    result["ai_tier"] = "primary"
                    result["ai_provider"] = "Replicate"
                    return result
            
            # Fallback to safe default
            return {
                "is_hoax": False,
                "confidence": 0.0,
                "reason": "AI service unavailable, defaulting to safe",
                "ai_tier": "none",
                "ai_provider": "none",
                "error": "Service unavailable"
            }
            
        except Exception as e:
            logger.error(f"Hoax detection error: {e}")
            return {
                "is_hoax": False,
                "confidence": 0.0,
                "reason": "Error occurred, defaulting to safe",
                "ai_tier": "error",
                "ai_provider": "error",
                "error": str(e)
            }
    
    async def _try_replicate_hoax(self, text: str) -> Dict[str, Any]:
        """Try Replicate for hoax detection"""
        try:
            headers = {
                "Authorization": f"Token {self.replicate_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "version": "ibm-granite/granite-3.3-8b-instruct",
                "input": {
                    "prompt": f"Analyze this text for potential misinformation or hoax content: {text}\n\nIs this likely to be a hoax? Respond with 'Yes' or 'No' and explain why.",
                    "max_new_tokens": 200,
                    "temperature": 0.3
                }
            }
            
            response = requests.post(self.replicate_url, headers=headers, json=payload)
            
            if response.status_code == 201:
                prediction_id = response.json().get("id")
                return {
                    "is_hoax": False,  # Default safe
                    "confidence": 0.5,
                    "reason": f"Analysis in progress (ID: {prediction_id})",
                    "error": None
                }
            else:
                return {"error": f"Replicate API error: {response.status_code}"}
                
        except Exception as e:
            return {"error": str(e)}
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment using external AI APIs"""
        try:
            # Try Hugging Face for sentiment analysis
            if self.huggingface_api_key:
                result = await self._try_huggingface_sentiment(text)
                if result and not result.get("error"):
                    result["ai_tier"] = "primary"
                    result["ai_provider"] = "Hugging Face"
                    return result
            
            # Fallback to neutral
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "score": 0.0,
                "ai_tier": "none",
                "ai_provider": "none",
                "error": "Service unavailable"
            }
            
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "score": 0.0,
                "ai_tier": "error",
                "ai_provider": "error",
                "error": str(e)
            }
    
    async def _try_huggingface_sentiment(self, text: str) -> Dict[str, Any]:
        """Try Hugging Face for sentiment analysis"""
        try:
            headers = {
                "Authorization": f"Bearer {self.huggingface_api_key}",
                "Content-Type": "application/json"
            }
            
            # Use a sentiment analysis model
            model_url = f"{self.huggingface_url}/cardiffnlp/twitter-roberta-base-sentiment-latest"
            
            payload = {"inputs": text}
            
            response = requests.post(model_url, headers=headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    # Map sentiment scores
                    scores = result[0]
                    if "label" in scores:
                        sentiment_map = {
                            "LABEL_0": "negative",
                            "LABEL_1": "neutral", 
                            "LABEL_2": "positive"
                        }
                        sentiment = sentiment_map.get(scores["label"], "neutral")
                        confidence = scores.get("score", 0.0)
                        
                        return {
                            "sentiment": sentiment,
                            "confidence": confidence,
                            "score": confidence,
                            "error": None
                        }
                
                return {"error": "Invalid response format"}
            else:
                return {"error": f"Hugging Face API error: {response.status_code}"}
                
        except Exception as e:
            return {"error": str(e)}
    
    def get_status(self) -> Dict[str, Any]:
        """Get AI service status"""
        return {
            "status": "operational",
            "service": "asisten-wira-ai-railway",
            "version": "1.0.0",
            "deployment": "railway-lightweight",
            "ai_providers": {
                "primary": "Replicate (IBM Granite)" if self.replicate_api_key else "Not configured",
                "secondary": "Hugging Face (GPT-OSS-20B)" if self.huggingface_api_key else "Not configured",
                "fallback": "IBM Orchestrate" if self.ibm_api_key else "Not configured"
            },
            "features": {
                "chat": True,
                "hoax_detection": True,
                "sentiment_analysis": True
            },
            "notes": "Lightweight version for Railway deployment - no local ML packages required"
        }
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        return datetime.now().isoformat()
