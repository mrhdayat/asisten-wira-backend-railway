import requests
import json
from typing import Dict, List, Optional, Any
from config import settings
import logging

logger = logging.getLogger(__name__)

class IBMWatsonxClient:
    """Client for interacting with IBM Watsonx AI models"""
    
    def __init__(self):
        self.api_key = settings.ibm_orchestrate_api_key
        self.base_url = settings.ibm_orchestrate_base_url
        self.access_token = None
        
    async def get_access_token(self) -> str:
        """Get IBM Cloud access token"""
        if not self.api_key:
            raise Exception("IBM Watsonx API key not configured")
            
        auth_url = "https://iam.cloud.ibm.com/identity/token"
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {
            "grant_type": "urn:iam:params:oauth:grant-type:apikey",
            "apikey": self.api_key
        }
        
        try:
            response = requests.post(auth_url, headers=headers, data=data)
            response.raise_for_status()
            token_data = response.json()
            self.access_token = token_data["access_token"]
            return self.access_token
        except requests.RequestException as e:
            logger.error(f"Error getting IBM access token: {str(e)}")
            raise Exception(f"Failed to authenticate with IBM: {str(e)}")
    
    async def query_granite_model(self, prompt: str, model_id: str = "ibm-granite/granite-3.3-8b-instruct") -> Dict[str, Any]:
        """Query IBM Granite model for text generation"""
        if not self.access_token:
            await self.get_access_token()
        
        url = f"{self.base_url}/ml/v1/text/generation?version=2023-05-29"
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.access_token}"
        }
        
        body = {
            "input": prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 300,  # Increased for more detailed responses
                "temperature": 0.8,     # Slightly higher for more creative responses
                "top_p": 0.9,
                "stop_sequences": ["\n\n", "Pengguna:", "User:"]
            },
            "model_id": model_id
            # Note: project_id is not required for IBM Orchestrate API
        }
        
        try:
            response = requests.post(url, headers=headers, json=body)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error querying Granite model: {str(e)}")
            raise Exception(f"Failed to query Granite model: {str(e)}")
    
    async def generate_chat_response(self, 
                                   message: str, 
                                   context: Optional[str] = None) -> Dict[str, Any]:
        """Generate chatbot response using IBM Granite model"""
        
        # Enhanced system prompt for general-purpose AI assistant
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
        
        try:
            result = await self.query_granite_model(full_prompt)
            
            if "results" in result and len(result["results"]) > 0:
                generated_text = result["results"][0]["generated_text"].strip()
                
                # Clean up the response - remove the prompt part
                if "Asisten Wira:" in generated_text:
                    generated_text = generated_text.split("Asisten Wira:")[-1].strip()
                
                # Remove any remaining prompt artifacts
                generated_text = generated_text.replace(full_prompt, "").strip()
                
                # Extract token info for confidence estimation
                token_count = result["results"][0].get("generated_token_count", 0)
                confidence = min(0.95, 0.6 + (token_count / 100) * 0.3)  # Heuristic confidence
                
                return {
                    "response": generated_text,
                    "confidence": confidence,
                    "model_used": "ibm-granite",
                    "token_count": token_count,
                    "is_general_response": True  # Indicates this is a general-purpose response
                }
            else:
                return {
                    "response": "Maaf, saya tidak dapat memproses pertanyaan Anda saat ini. Silakan coba lagi.",
                    "confidence": 0.0,
                    "model_used": "ibm-granite",
                    "error": "No results returned"
                }
                
        except Exception as e:
            logger.error(f"Error generating chat response with IBM: {str(e)}")
            return {
                "response": "Maaf, terjadi kesalahan sistem. Tim teknis kami sedang memperbaiki masalah ini.",
                "confidence": 0.0,
                "model_used": "ibm-granite",
                "error": str(e)
            }
    
    async def classify_text(self, text: str, categories: List[str]) -> Dict[str, Any]:
        """Classify text into categories using IBM models"""
        
        prompt = f"""Klasifikasikan teks berikut ke dalam salah satu kategori: {', '.join(categories)}

Teks: {text}

Kategori yang paling sesuai:"""

        try:
            result = await self.query_granite_model(prompt)
            
            if "results" in result and len(result["results"]) > 0:
                classification = result["results"][0]["generated_text"].strip()
                
                # Find best matching category
                classification_lower = classification.lower()
                best_match = None
                for category in categories:
                    if category.lower() in classification_lower:
                        best_match = category
                        break
                
                if not best_match:
                    best_match = categories[0]  # Default to first category
                
                # Estimate confidence based on text clarity
                confidence = 0.8 if best_match.lower() in classification_lower else 0.6
                
                return {
                    "category": best_match,
                    "confidence": confidence,
                    "raw_response": classification
                }
            else:
                return {
                    "category": categories[0],
                    "confidence": 0.5,
                    "error": "No classification result"
                }
                
        except Exception as e:
            logger.error(f"Error in text classification: {str(e)}")
            return {
                "category": categories[0],
                "confidence": 0.0,
                "error": str(e)
            }
    
    async def detect_hoax(self, text: str) -> Dict[str, Any]:
        """Detect hoax/misinformation using IBM Granite model"""
        
        prompt = f"""Analisis teks berikut untuk mendeteksi kemungkinan hoax atau misinformasi.
Berikan analisis dalam format berikut:
- Status: HOAX/BUKAN_HOAX
- Tingkat Kepercayaan: [0-100]%
- Penjelasan: [alasan singkat]

Teks untuk dianalisis:
{text}

Analisis:"""

        try:
            result = await self.query_granite_model(prompt)
            
            if "results" in result and len(result["results"]) > 0:
                analysis = result["results"][0]["generated_text"].strip()
                
                # Parse the response
                is_hoax = "HOAX" in analysis.upper() and "BUKAN_HOAX" not in analysis.upper()
                
                # Extract confidence (rough estimation)
                confidence = 0.7  # Default
                if "%" in analysis:
                    try:
                        import re
                        confidence_match = re.search(r'(\d+)%', analysis)
                        if confidence_match:
                            confidence = int(confidence_match.group(1)) / 100
                    except:
                        pass
                
                return {
                    "is_hoax": is_hoax,
                    "confidence": confidence,
                    "explanation": analysis,
                    "model_used": "ibm-granite"
                }
            else:
                return {
                    "is_hoax": False,
                    "confidence": 0.5,
                    "explanation": "Tidak dapat menganalisis teks. Silakan verifikasi secara manual.",
                    "error": "No analysis result"
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
        """Analyze sentiment using IBM Granite model"""
        
        prompt = f"""Analisis sentimen dari teks berikut dalam Bahasa Indonesia.
Berikan hasil dalam format:
- Sentimen: POSITIF/NEGATIF/NETRAL
- Tingkat Kepercayaan: [0-100]%
- Emosi dominan: [emosi utama yang terdeteksi]

Teks:
{text}

Analisis Sentimen:"""

        try:
            result = await self.query_granite_model(prompt)
            
            if "results" in result and len(result["results"]) > 0:
                analysis = result["results"][0]["generated_text"].strip()
                
                # Parse sentiment
                sentiment = "neutral"
                if "POSITIF" in analysis.upper():
                    sentiment = "positive"
                elif "NEGATIF" in analysis.upper():
                    sentiment = "negative"
                
                # Extract confidence
                confidence = 0.75  # Default
                if "%" in analysis:
                    try:
                        import re
                        confidence_match = re.search(r'(\d+)%', analysis)
                        if confidence_match:
                            confidence = int(confidence_match.group(1)) / 100
                    except:
                        pass
                
                # Generate emotion breakdown based on sentiment
                if sentiment == "positive":
                    emotions = {
                        "joy": 0.8, "trust": 0.7, "anticipation": 0.6,
                        "surprise": 0.3, "fear": 0.1, "sadness": 0.1,
                        "disgust": 0.1, "anger": 0.1
                    }
                elif sentiment == "negative":
                    emotions = {
                        "joy": 0.1, "trust": 0.2, "anticipation": 0.3,
                        "surprise": 0.3, "fear": 0.6, "sadness": 0.7,
                        "disgust": 0.5, "anger": 0.6
                    }
                else:
                    emotions = {
                        "joy": 0.4, "trust": 0.4, "anticipation": 0.4,
                        "surprise": 0.3, "fear": 0.3, "sadness": 0.3,
                        "disgust": 0.2, "anger": 0.2
                    }
                
                return {
                    "sentiment": sentiment,
                    "confidence": confidence,
                    "emotions": emotions,
                    "raw_analysis": analysis,
                    "model_used": "ibm-granite"
                }
            else:
                return {
                    "sentiment": "neutral",
                    "confidence": 0.5,
                    "emotions": {},
                    "error": "No sentiment analysis result"
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
ibm_watsonx_client = IBMWatsonxClient()
