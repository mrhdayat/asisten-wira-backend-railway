import requests
import json
from typing import Dict, List, Optional, Any
from config import settings
import logging

logger = logging.getLogger(__name__)

class HuggingFaceClient:
    """Client for interacting with Hugging Face models"""
    
    def __init__(self):
        self.api_token = settings.huggingface_api_token
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
        self.base_url = "https://api-inference.huggingface.co/models"
    
    async def query_model(self, model_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Generic method to query any Hugging Face model"""
        url = f"{self.base_url}/{model_name}"
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error querying model {model_name}: {str(e)}")
            raise Exception(f"Failed to query model: {str(e)}")
    
    async def generate_chat_response(self, 
                                   message: str, 
                                   context: Optional[str] = None,
                                   model: str = None) -> Dict[str, Any]:
        """Generate chatbot response using language model"""
        model_name = model or settings.default_llm_model
        
        # Enhanced prompt for general-purpose AI assistant
        system_prompt = """Anda adalah asisten AI yang cerdas dan ramah bernama Asisten Wira. 
Anda dapat membantu dengan berbagai pertanyaan dan topik, tidak hanya terbatas pada bisnis UMKM.

Kemampuan Anda:
- Menjawab pertanyaan umum seperti ChatGPT atau Gemini
- Memberikan informasi yang akurat dan up-to-date
- Membantu dengan pertanyaan bisnis, teknologi, pendidikan, dan topik lainnya
- Berkomunikasi dalam Bahasa Indonesia yang ramah dan profesional
- Jika tidak tahu jawaban, akui dengan jujur dan berikan saran alternatif

"""
        
        context_text = f"Konteks tambahan: {context}\n\n" if context else ""
        
        # Enhanced prompt format
        full_prompt = f"{system_prompt}{context_text}Pengguna: {message}\n\nAsisten Wira:"

        payload = {
            "inputs": full_prompt,
            "parameters": {
                "max_new_tokens": 300,  # Increased for more detailed responses
                "temperature": 0.8,     # Slightly higher for more creative responses
                "do_sample": True,
                "return_full_text": False,
                "top_p": 0.9,
                "repetition_penalty": 1.1
            }
        }
        
        try:
            result = await self.query_model(model_name, payload)
            
            if isinstance(result, list) and len(result) > 0:
                response_text = result[0].get("generated_text", "").strip()
                
                # Clean up the response - remove the prompt part
                if "Asisten Wira:" in response_text:
                    response_text = response_text.split("Asisten Wira:")[-1].strip()
                elif "Jawaban:" in response_text:
                    response_text = response_text.split("Jawaban:")[-1].strip()
                
                # Remove any remaining prompt artifacts
                response_text = response_text.replace(full_prompt, "").strip()
                
                # If response is too short, try with fallback model
                if len(response_text) < 20 and model_name != settings.fallback_llm_model:
                    logger.info(f"Response too short, trying fallback model: {settings.fallback_llm_model}")
                    return await self.generate_chat_response(message, context, settings.fallback_llm_model)
                
                return {
                    "response": response_text,
                    "confidence": 0.85,
                    "model_used": model_name,
                    "is_general_response": True  # Indicates this is a general-purpose response
                }
            else:
                return {
                    "response": "Maaf, saya tidak dapat memproses pertanyaan Anda saat ini. Silakan coba lagi.",
                    "confidence": 0.0,
                    "model_used": model_name,
                    "error": "No results returned"
                }
                
        except Exception as e:
            logger.error(f"Error generating chat response: {str(e)}")
            # Try fallback model if available
            if model_name != settings.fallback_llm_model:
                try:
                    logger.info(f"Trying fallback model due to error: {settings.fallback_llm_model}")
                    return await self.generate_chat_response(message, context, settings.fallback_llm_model)
                except Exception as fallback_error:
                    logger.error(f"Fallback model also failed: {str(fallback_error)}")
            
            return {
                "response": "Maaf, terjadi kesalahan sistem. Tim teknis kami sedang memperbaiki masalah ini.",
                "confidence": 0.0,
                "model_used": model_name,
                "error": str(e)
            }
    
    async def detect_hoax(self, text: str) -> Dict[str, Any]:
        """Detect if text contains hoax/misinformation"""
        # For demonstration, we'll use a classification model
        # In practice, you'd use a specialized hoax detection model
        
        payload = {
            "inputs": f"Classify this text as hoax or not hoax: {text}",
            "parameters": {
                "candidate_labels": ["hoax", "not hoax", "misinformation", "factual"]
            }
        }
        
        try:
            # Using zero-shot classification for demonstration
            model_name = "facebook/bart-large-mnli"
            result = await self.query_model(model_name, payload)
            
            if "labels" in result and "scores" in result:
                labels = result["labels"]
                scores = result["scores"]
                
                # Check if "hoax" or "misinformation" has high confidence
                hoax_score = 0.0
                for i, label in enumerate(labels):
                    if label.lower() in ["hoax", "misinformation"]:
                        hoax_score = max(hoax_score, scores[i])
                
                is_hoax = hoax_score > 0.6
                
                return {
                    "is_hoax": is_hoax,
                    "confidence": hoax_score,
                    "explanation": f"Analisis AI menunjukkan tingkat kepercayaan {hoax_score:.2%} bahwa teks ini mengandung misinformasi." if is_hoax else "Teks ini tampaknya tidak mengandung misinformasi berdasarkan analisis AI.",
                    "details": {
                        "labels": labels,
                        "scores": scores
                    }
                }
            else:
                return {
                    "is_hoax": False,
                    "confidence": 0.5,
                    "explanation": "Tidak dapat menganalisis teks secara menyeluruh. Silakan verifikasi secara manual.",
                    "details": result
                }
                
        except Exception as e:
            logger.error(f"Error in hoax detection: {str(e)}")
            return {
                "is_hoax": False,
                "confidence": 0.0,
                "explanation": f"Terjadi kesalahan saat menganalisis: {str(e)}",
                "error": str(e)
            }
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text"""
        
        payload = {
            "inputs": text
        }
        
        try:
            # Use Indonesian sentiment analysis model if available
            model_name = "nlptown/bert-base-multilingual-uncased-sentiment"
            result = await self.query_model(model_name, payload)
            
            if isinstance(result, list) and len(result) > 0:
                sentiment_data = result[0]
                
                # Map sentiment labels to Indonesian
                sentiment_mapping = {
                    "POSITIVE": "positive",
                    "NEGATIVE": "negative", 
                    "NEUTRAL": "neutral",
                    "1 star": "negative",
                    "2 stars": "negative",
                    "3 stars": "neutral",
                    "4 stars": "positive",
                    "5 stars": "positive"
                }
                
                if isinstance(sentiment_data, list):
                    # Sort by score and get the highest
                    sentiment_data.sort(key=lambda x: x.get("score", 0), reverse=True)
                    top_sentiment = sentiment_data[0]
                    
                    original_label = top_sentiment.get("label", "NEUTRAL")
                    sentiment = sentiment_mapping.get(original_label, "neutral")
                    confidence = top_sentiment.get("score", 0.5)
                    
                else:
                    sentiment = "neutral"
                    confidence = 0.5
                
                # Generate emotion breakdown (simplified)
                emotions = {
                    "joy": 0.8 if sentiment == "positive" else 0.2,
                    "trust": 0.7 if sentiment == "positive" else 0.3,
                    "anticipation": 0.4,
                    "surprise": 0.2,
                    "fear": 0.1 if sentiment == "positive" else 0.6,
                    "sadness": 0.1 if sentiment == "positive" else 0.7,
                    "disgust": 0.1 if sentiment == "positive" else 0.5,
                    "anger": 0.1 if sentiment == "positive" else 0.6
                }
                
                return {
                    "sentiment": sentiment,
                    "confidence": confidence,
                    "emotions": emotions,
                    "raw_result": result
                }
            else:
                return {
                    "sentiment": "neutral",
                    "confidence": 0.5,
                    "emotions": {
                        "joy": 0.4, "trust": 0.4, "anticipation": 0.4,
                        "surprise": 0.2, "fear": 0.3, "sadness": 0.3,
                        "disgust": 0.2, "anger": 0.2
                    },
                    "raw_result": result
                }
                
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {str(e)}")
            return {
                "sentiment": "neutral",
                "confidence": 0.0,
                "emotions": {},
                "error": str(e)
            }

# Global instance
huggingface_client = HuggingFaceClient()
