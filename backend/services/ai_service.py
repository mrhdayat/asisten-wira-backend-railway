import logging
from datetime import datetime
from typing import Dict, Any, Optional, List

from ai_models.replicate_client import ReplicateClient
from ai_models.huggingface_client import HuggingFaceClient
from ai_models.ibm_watsonx_client import IBMWatsonxClient
from config import settings

logger = logging.getLogger(__name__)

class AIService:
    """Unified AI service that can use either IBM Watsonx or Hugging Face"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Initialize AI clients with new priority order
        # Primary: Replicate (with IBM Granite model)
        # Secondary: Hugging Face (OpenAI GPT-OSS-20B)
        # Fallback: IBM Orchestrate (only if needed)
        
        try:
            self.primary_client = ReplicateClient()
            self.logger.info("Primary AI client (Replicate) initialized successfully")
        except Exception as e:
            self.logger.error(f"Failed to initialize primary AI client (Replicate): {e}")
            self.primary_client = None
        
        try:
            self.secondary_client = HuggingFaceClient()
            self.logger.info("Secondary AI client (Hugging Face) initialized successfully")
        except Exception as e:
            self.logger.error(f"Failed to initialize secondary AI client (Hugging Face): {e}")
            self.secondary_client = None
        
        try:
            self.fallback_client = IBMWatsonxClient()
            self.logger.info("Fallback AI client (IBM Orchestrate) initialized successfully")
        except Exception as e:
            self.logger.error(f"Failed to initialize fallback AI client (IBM Orchestrate): {e}")
            self.fallback_client = None
    
    def _get_client_name(self, client) -> str:
        """Get human-readable client name"""
        if client == IBMWatsonxClient:
            return "IBM Orchestrate"
        elif client == ReplicateClient:
            return "Replicate"
        elif client == HuggingFaceClient:
            return "Hugging Face"
        else:
            return "None"
    
    async def generate_chat_response(self, 
                                   message: str, 
                                   context: Optional[str] = None,
                                   chatbot_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate chatbot response with new priority order: Replicate > Hugging Face > IBM"""
        
        try:
            # Try primary client first (Replicate with IBM Granite model)
            if self.primary_client:
                logger.info(f"Trying primary AI client: {self._get_client_name(self.primary_client)}")
                result = await self.primary_client.generate_chat_response(message, context)
                
                # Check if response is good enough
                if not result.get("error") and result.get("response") and len(result.get("response", "")) > 10:
                    result["chatbot_id"] = chatbot_id
                    result["timestamp"] = self._get_timestamp()
                    result["ai_tier"] = "primary"
                    result["ai_provider"] = self._get_client_name(self.primary_client)
                    return result
                else:
                    logger.warning(f"Primary AI client response quality insufficient: {result.get('error', 'Response too short')}")
            
            # If primary fails or response quality is poor, try secondary client (Hugging Face)
            if self.secondary_client:
                logger.info(f"Trying secondary AI client: {self._get_client_name(self.secondary_client)}")
                result = await self.secondary_client.generate_chat_response(message, context)
                
                if not result.get("error") and result.get("response") and len(result.get("response", "")) > 10:
                    result["chatbot_id"] = chatbot_id
                    result["timestamp"] = self._get_timestamp()
                    result["ai_tier"] = "secondary"
                    result["ai_provider"] = self._get_client_name(self.secondary_client)
                    return result
                else:
                    logger.warning(f"Secondary AI client response quality insufficient: {result.get('error', 'Response too short')}")
            
            # If both fail, try fallback client (IBM Orchestrate) - only as last resort
            if self.fallback_client:
                logger.info(f"Trying fallback AI client (IBM Orchestrate) as last resort: {self._get_client_name(self.fallback_client)}")
                result = await self.fallback_client.generate_chat_response(message, context)
                
                if not result.get("error") and result.get("response") and len(result.get("response", "")) > 10:
                    result["chatbot_id"] = chatbot_id
                    result["timestamp"] = self._get_timestamp()
                    result["ai_tier"] = "fallback"
                    result["ai_provider"] = self._get_client_name(self.fallback_client)
                    return result
            
            # If all clients fail, return a helpful error message
            logger.error("All AI clients failed to generate response")
            return {
                "response": "Maaf, saya sedang mengalami kesulitan teknis. Silakan coba lagi dalam beberapa saat atau hubungi tim support kami.",
                "confidence": 0.0,
                "error": "All AI clients failed",
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
    
    async def detect_hoax(self, text: str) -> Dict[str, Any]:
        """Detect hoax with new priority order: Replicate > Hugging Face > IBM"""
        
        try:
            # Try primary client first (Replicate)
            if self.primary_client and hasattr(self.primary_client, 'detect_hoax'):
                logger.info(f"Trying primary hoax detection: {self._get_client_name(self.primary_client)}")
                try:
                    result = await self.primary_client.detect_hoax(text)
                    if result and not result.get("error"):
                        result["ai_tier"] = "primary"
                        result["ai_provider"] = self._get_client_name(self.primary_client)
                        return result
                except Exception as e:
                    logger.warning(f"Primary hoax detection failed: {e}")
            
            # Try secondary client (Hugging Face)
            if self.secondary_client and hasattr(self.secondary_client, 'detect_hoax'):
                logger.info(f"Trying secondary hoax detection: {self._get_client_name(self.secondary_client)}")
                try:
                    result = await self.secondary_client.detect_hoax(text)
                    if result and not result.get("error"):
                        result["ai_tier"] = "secondary"
                        result["ai_provider"] = self._get_client_name(self.secondary_client)
                        return result
                except Exception as e:
                    logger.warning(f"Secondary hoax detection failed: {e}")
            
            # Try fallback client (IBM Orchestrate) - only as last resort
            if self.fallback_client and hasattr(self.fallback_client, 'detect_hoax'):
                logger.info(f"Trying fallback hoax detection (IBM Orchestrate): {self._get_client_name(self.fallback_client)}")
                try:
                    result = await self.fallback_client.detect_hoax(text)
                    if result and not result.get("error"):
                        result["ai_tier"] = "fallback"
                        result["ai_provider"] = self._get_client_name(self.fallback_client)
                        return result
                except Exception as e:
                    logger.warning(f"Fallback hoax detection failed: {e}")
            
            # If all fail, return safe default
            logger.warning("All hoax detection clients failed, returning safe default")
            return {
                "is_hoax": False,
                "confidence": 0.0,
                "reason": "AI service unavailable, defaulting to safe",
                "ai_tier": "none",
                "ai_provider": "none",
                "error": "All clients failed"
            }
            
        except Exception as e:
            logger.error(f"Error in hoax detection: {str(e)}")
            return {
                "is_hoax": False,
                "confidence": 0.0,
                "reason": "Error occurred, defaulting to safe",
                "ai_tier": "error",
                "ai_provider": "error",
                "error": str(e)
            }
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment with new priority order: Replicate > Hugging Face > IBM"""
        
        try:
            # Try primary client first (Replicate)
            if self.primary_client and hasattr(self.primary_client, 'analyze_sentiment'):
                logger.info(f"Trying primary sentiment analysis: {self._get_client_name(self.primary_client)}")
                try:
                    result = await self.primary_client.analyze_sentiment(text)
                    if result and not result.get("error"):
                        result["ai_tier"] = "primary"
                        result["ai_provider"] = self._get_client_name(self.primary_client)
                        return result
                except Exception as e:
                    logger.warning(f"Primary sentiment analysis failed: {e}")
            
            # Try secondary client (Hugging Face)
            if self.secondary_client and hasattr(self.secondary_client, 'analyze_sentiment'):
                logger.info(f"Trying secondary sentiment analysis: {self._get_client_name(self.secondary_client)}")
                try:
                    result = await self.secondary_client.analyze_sentiment(text)
                    if result and not result.get("error"):
                        result["ai_tier"] = "secondary"
                        result["ai_provider"] = self._get_client_name(self.secondary_client)
                        return result
                except Exception as e:
                    logger.warning(f"Secondary sentiment analysis failed: {e}")
            
            # Try fallback client (IBM Orchestrate) - only as last resort
            if self.fallback_client and hasattr(self.fallback_client, 'analyze_sentiment'):
                logger.info(f"Trying fallback sentiment analysis (IBM Orchestrate): {self._get_client_name(self.fallback_client)}")
                try:
                    result = await self.fallback_client.analyze_sentiment(text)
                    if result and not result.get("error"):
                        result["ai_tier"] = "fallback"
                        result["ai_provider"] = self._get_client_name(self.fallback_client)
                        return result
                except Exception as e:
                    logger.warning(f"Fallback sentiment analysis failed: {e}")
            
            # If all fail, return neutral sentiment
            logger.warning("All sentiment analysis clients failed, returning neutral")
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "ai_tier": "none",
                "ai_provider": "none",
                "error": "All clients failed"
            }
            
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {str(e)}")
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "ai_tier": "error",
                "ai_provider": "error",
                "error": str(e)
            }
    
    async def process_knowledge_base(self, 
                                   content: str, 
                                   source: Optional[str] = None) -> Dict[str, Any]:
        """Process and vectorize knowledge base content"""
        
        try:
            # TODO: Implement proper knowledge base processing
            # This would typically involve:
            # 1. Text chunking
            # 2. Embedding generation
            # 3. Vector storage (e.g., Pinecone, Weaviate, or local FAISS)
            
            # For now, return a simple processed result
            chunks = self._chunk_text(content)
            
            return {
                "status": "success",
                "chunks_created": len(chunks),
                "source": source,
                "content_length": len(content),
                "timestamp": self._get_timestamp()
            }
            
        except Exception as e:
            logger.error(f"Error processing knowledge base: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": self._get_timestamp()
            }
    
    async def search_knowledge_base(self, 
                                  query: str, 
                                  chatbot_id: str,
                                  limit: int = 5) -> List[Dict[str, Any]]:
        """Search knowledge base for relevant content"""
        
        try:
            # TODO: Implement proper vector search
            # This would typically involve:
            # 1. Query embedding generation
            # 2. Vector similarity search
            # 3. Ranking and filtering
            
            # For now, return mock results
            return [
                {
                    "content": "Informasi produk yang relevan dengan pertanyaan Anda...",
                    "source": "product_catalog.pdf",
                    "confidence": 0.85,
                    "chunk_id": "chunk_1"
                }
            ]
            
        except Exception as e:
            logger.error(f"Error searching knowledge base: {str(e)}")
            return []
    
    def _chunk_text(self, text: str, chunk_size: int = 500) -> List[str]:
        """Split text into chunks for processing"""
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk)
        
        return chunks
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        return datetime.utcnow().isoformat()
    
    def get_status(self) -> Dict[str, Any]:
        """Get AI service status with new priority order"""
        return {
            "primary_service": "Replicate (IBM Granite)",
            "secondary_service": "Hugging Face (OpenAI GPT-OSS-20B)",
            "fallback_service": "IBM Orchestrate",
            "replicate_configured": self.primary_client is not None,
            "huggingface_configured": self.secondary_client is not None,
            "ibm_configured": self.fallback_client is not None,
            "total_providers": sum([
                self.primary_client is not None,
                self.secondary_client is not None,
                self.fallback_client is not None
            ]),
            "timestamp": self._get_timestamp()
        }

# Global AI service instance
ai_service = AIService()
