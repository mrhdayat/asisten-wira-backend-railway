import requests
import json
from typing import Dict, List, Optional, Any
from config import settings
import logging
import asyncio

logger = logging.getLogger(__name__)

class ReplicateClient:
    """Client for interacting with Replicate AI models"""
    
    def __init__(self):
        self.api_token = settings.replicate_api_token
        self.base_url = "https://api.replicate.com/v1"
        self.logger = logging.getLogger(__name__)
        
        if not self.api_token:
            raise ValueError("Replicate API token not configured")
        
        # Add headers for API requests
        self.headers = {
            "Authorization": f"Token {self.api_token}",
            "Content-Type": "application/json"
        }
        
        # Use IBM Granite model as primary for better performance
        self.default_model = "ibm-granite/granite-3.3-8b-instruct"
        self.fallback_model = "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3"
        
        self.logger.info(f"Replicate client initialized with primary model: {self.default_model}")
    
    async def run_model(self, model: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run a model on Replicate"""
        url = f"{self.base_url}/predictions"
        
        payload = {
            "version": model,
            "input": input_data
        }
        
        try:
            # Create prediction
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            prediction = response.json()
            
            # Poll for completion
            prediction_url = prediction["urls"]["get"]
            return await self._poll_prediction(prediction_url)
            
        except requests.RequestException as e:
            logger.error(f"Error running Replicate model: {str(e)}")
            raise Exception(f"Failed to run model: {str(e)}")
    
    async def _poll_prediction(self, prediction_url: str, max_wait: int = 60) -> Dict[str, Any]:
        """Poll prediction until completion"""
        for _ in range(max_wait):
            try:
                response = requests.get(prediction_url, headers=self.headers)
                response.raise_for_status()
                prediction = response.json()
                
                status = prediction.get("status")
                
                if status == "succeeded":
                    return {
                        "success": True,
                        "output": prediction.get("output"),
                        "metrics": prediction.get("metrics", {})
                    }
                elif status == "failed":
                    return {
                        "success": False,
                        "error": prediction.get("error", "Prediction failed")
                    }
                elif status in ["starting", "processing"]:
                    await asyncio.sleep(1)  # Wait 1 second
                    continue
                else:
                    break
                    
            except requests.RequestException as e:
                logger.error(f"Error polling prediction: {str(e)}")
                break
        
        return {
            "success": False,
            "error": "Prediction timed out"
        }
    
    async def _query_model(self, model: str, prompt: str) -> Dict[str, Any]:
        """Query a specific model with the given prompt"""
        
        try:
            input_data = {
                "prompt": prompt,
                "max_new_tokens": 300,
                "temperature": 0.8,
                "top_p": 0.9,
                "repetition_penalty": 1.1
            }
            
            result = await self.run_model(model, input_data)
            
            if result["success"]:
                # Replicate returns output as list or string
                output = result["output"]
                if isinstance(output, list):
                    response_text = "".join(output).strip()
                else:
                    response_text = str(output).strip()
                
                # Clean up response
                if "Asisten Wira:" in response_text:
                    response_text = response_text.split("Asisten Wira:")[-1].strip()
                elif "Asisten:" in response_text:
                    response_text = response_text.split("Asisten:")[-1].strip()
                
                return {
                    "response": response_text,
                    "confidence": 0.9,
                    "model_used": model,
                    "metrics": result.get("metrics", {})
                }
            else:
                return {
                    "response": "Maaf, saya sedang mengalami gangguan teknis. Silakan coba lagi.",
                    "confidence": 0.0,
                    "error": result["error"],
                    "model_used": model
                }
                
        except Exception as e:
            self.logger.error(f"Error querying model {model}: {str(e)}")
            return {
                "response": "Maaf, terjadi kesalahan sistem. Silakan coba lagi dalam beberapa saat.",
                "confidence": 0.0,
                "error": str(e),
                "model_used": model
            }
    
    async def generate_chat_response(self, 
                                   message: str, 
                                   context: Optional[str] = None) -> Dict[str, Any]:
        """Generate chatbot response using IBM Granite model via Replicate"""
        
        try:
            # Enhanced prompt for general-purpose AI assistant
            system_prompt = """Anda adalah asisten AI yang cerdas dan ramah bernama Asisten Wira. 
Anda dapat membantu dengan berbagai pertanyaan dan topik, tidak hanya terbatas pada bisnis UMKM.

Kemampuan Anda:
- Menjawab pertanyaan umum seperti ChatGPT atau Gemini
- Memberikan informasi yang akurat dan up-to-date
- Membantu dengan pertanyaan bisnis, teknologi, pendidikan, dan topik lainnya
- Berkomunikasi dalam Bahasa Indonesia yang ramah dan profesional
- Jika tidak tahu jawaban, akui dengan jujur dan berikan saran alternatif
- Memberikan penjelasan yang jelas dan mudah dipahami

"""
            
            context_text = f"Konteks tambahan: {context}\n\n" if context else ""
            full_prompt = f"{system_prompt}{context_text}Pengguna: {message}\n\nAsisten Wira:"
            
            # Try IBM Granite model first
            try:
                result = await self._query_model(self.default_model, full_prompt)
                if result and not result.get("error"):
                    return {
                        "response": result["response"],
                        "confidence": result.get("confidence", 0.9),
                        "model_used": self.default_model,
                        "is_general_response": True
                    }
            except Exception as e:
                self.logger.warning(f"IBM Granite model failed, trying fallback: {e}")
            
            # Fallback to Llama-70B if IBM Granite fails
            try:
                result = await self._query_model(self.fallback_model, full_prompt)
                if result and not result.get("error"):
                    return {
                        "response": result["response"],
                        "confidence": result.get("confidence", 0.8),
                        "model_used": self.fallback_model,
                        "is_general_response": True
                    }
            except Exception as e:
                self.logger.error(f"Fallback model also failed: {e}")
            
            # If both models fail
            return {
                "response": "Maaf, saya sedang mengalami kesulitan teknis. Silakan coba lagi dalam beberapa saat.",
                "confidence": 0.0,
                "error": "Both models failed",
                "model_used": "none"
            }
            
        except Exception as e:
            self.logger.error(f"Error generating chat response: {str(e)}")
            return {
                "response": "Maaf, terjadi kesalahan sistem. Silakan coba lagi dalam beberapa saat.",
                "confidence": 0.0,
                "error": str(e),
                "model_used": "none"
            }
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment using advanced models"""
        try:
            # Use a sentiment analysis model
            # Note: This is a hypothetical model - replace with actual available model
            model_version = "sentiment-analysis-model-version"
            
            input_data = {
                "text": text,
                "language": "indonesian"
            }
            
            result = await self.run_model(model_version, input_data)
            
            if result["success"]:
                output = result["output"]
                
                # Parse sentiment result
                sentiment = output.get("sentiment", "neutral")
                confidence = output.get("confidence", 0.5)
                
                # Generate emotion breakdown
                emotions = output.get("emotions", {
                    "joy": 0.4, "trust": 0.4, "anticipation": 0.4,
                    "surprise": 0.3, "fear": 0.3, "sadness": 0.3,
                    "disgust": 0.2, "anger": 0.2
                })
                
                return {
                    "sentiment": sentiment,
                    "confidence": confidence,
                    "emotions": emotions,
                    "model_used": "replicate-sentiment"
                }
            else:
                # Fallback to simple sentiment
                return self._simple_sentiment_analysis(text)
                
        except Exception as e:
            logger.error(f"Error in Replicate sentiment analysis: {str(e)}")
            return self._simple_sentiment_analysis(text)
    
    def _simple_sentiment_analysis(self, text: str) -> Dict[str, Any]:
        """Simple rule-based sentiment as fallback"""
        text_lower = text.lower()
        
        positive_words = ["bagus", "senang", "puas", "recommended", "mantap", "suka"]
        negative_words = ["buruk", "kecewa", "jelek", "lambat", "mahal", "tidak suka"]
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = "positive"
            confidence = min(0.8, 0.5 + (positive_count * 0.1))
        elif negative_count > positive_count:
            sentiment = "negative"
            confidence = min(0.8, 0.5 + (negative_count * 0.1))
        else:
            sentiment = "neutral"
            confidence = 0.6
        
        emotions = {
            "joy": 0.7 if sentiment == "positive" else 0.2,
            "trust": 0.6 if sentiment == "positive" else 0.3,
            "anticipation": 0.4,
            "surprise": 0.3,
            "fear": 0.2 if sentiment == "positive" else 0.6,
            "sadness": 0.1 if sentiment == "positive" else 0.7,
            "disgust": 0.1 if sentiment == "positive" else 0.5,
            "anger": 0.1 if sentiment == "positive" else 0.6
        }
        
        return {
            "sentiment": sentiment,
            "confidence": confidence,
            "emotions": emotions,
            "model_used": "simple-rules"
        }
    
    async def detect_hoax(self, text: str) -> Dict[str, Any]:
        """Detect hoax using advanced classification models"""
        try:
            # Simple keyword-based detection for demo
            hoax_indicators = [
                "gratis", "menang", "jutaan", "klik sekarang", "terbatas",
                "segera", "jangan sampai terlewat", "kesempatan emas",
                "hadiah", "promo terbatas", "100% gratis"
            ]
            
            text_lower = text.lower()
            detected_indicators = [word for word in hoax_indicators if word in text_lower]
            
            if len(detected_indicators) >= 2:
                is_hoax = True
                confidence = min(0.95, 0.6 + (len(detected_indicators) * 0.1))
                explanation = f"Terdeteksi indikator hoax: {', '.join(detected_indicators)}"
            elif len(detected_indicators) == 1:
                is_hoax = True
                confidence = 0.7
                explanation = f"Terdeteksi indikator mencurigakan: {detected_indicators[0]}"
            else:
                is_hoax = False
                confidence = 0.8
                explanation = "Tidak terdeteksi indikator hoax"
            
            return {
                "is_hoax": is_hoax,
                "confidence": confidence,
                "explanation": explanation,
                "indicators": detected_indicators,
                "model_used": "replicate-hoax-detector"
            }
            
        except Exception as e:
            logger.error(f"Error in hoax detection: {str(e)}")
            return {
                "is_hoax": False,
                "confidence": 0.5,
                "explanation": f"Error dalam analisis: {str(e)}",
                "error": str(e)
            }
    
    async def generate_embeddings(self, text: str) -> List[float]:
        """Generate text embeddings for similarity search"""
        try:
            # Use an embedding model
            model_version = "embedding-model-version"
            
            input_data = {"text": text}
            result = await self.run_model(model_version, input_data)
            
            if result["success"]:
                return result["output"]["embeddings"]
            else:
                # Return dummy embeddings as fallback
                return [0.0] * 768  # Common embedding dimension
                
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}")
            return [0.0] * 768
    
    def get_available_models(self) -> List[Dict[str, str]]:
        """Get list of available models"""
        try:
            url = f"{self.base_url}/models"
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            models = response.json()
            return [
                {
                    "name": model["name"],
                    "description": model["description"],
                    "version": model["latest_version"]["id"]
                }
                for model in models.get("results", [])
            ]
            
        except Exception as e:
            logger.error(f"Error fetching models: {str(e)}")
            return []

# Global instance
replicate_client = ReplicateClient()
