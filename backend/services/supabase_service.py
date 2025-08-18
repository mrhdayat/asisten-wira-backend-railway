from supabase import create_client, Client
from typing import Dict, List, Optional, Any
from config import settings
import logging
from datetime import datetime, timezone
import uuid

logger = logging.getLogger(__name__)

class SupabaseService:
    """Service for interacting with Supabase database and auth"""
    
    def __init__(self):
        self.supabase: Client = create_client(
            settings.supabase_url,
            settings.supabase_anon_key
        )
        self.admin_client: Client = create_client(
            settings.supabase_url,
            settings.supabase_service_role_key
        )
    
    # Authentication Methods
    async def create_user(self, email: str, password: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Create a new user account"""
        try:
            response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": metadata or {}
                }
            })
            
            if response.user:
                # Create user profile in custom table
                profile_data = {
                    "id": response.user.id,
                    "email": email,
                    "full_name": metadata.get("full_name") if metadata else None,
                    "business_name": metadata.get("business_name") if metadata else None,
                    "industry": metadata.get("industry") if metadata else None,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
                
                await self.create_user_profile(profile_data)
                
                return {
                    "success": True,
                    "user": {
                        "id": response.user.id,
                        "email": response.user.email,
                        "created_at": response.user.created_at
                    }
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to create user account"
                }
                
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def authenticate_user(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user and return session"""
        try:
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if response.user and response.session:
                return {
                    "success": True,
                    "user": {
                        "id": response.user.id,
                        "email": response.user.email
                    },
                    "session": {
                        "access_token": response.session.access_token,
                        "refresh_token": response.session.refresh_token,
                        "expires_at": response.session.expires_at
                    }
                }
            else:
                return {
                    "success": False,
                    "error": "Invalid credentials"
                }
                
        except Exception as e:
            logger.error(f"Error authenticating user: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    # User Profile Methods
    async def create_user_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create user profile in profiles table"""
        try:
            response = self.supabase.table("profiles").insert(profile_data).execute()
            return {"success": True, "data": response.data}
        except Exception as e:
            logger.error(f"Error creating user profile: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile by ID"""
        try:
            response = self.supabase.table("profiles").select("*").eq("id", user_id).execute()
            if response.data:
                return {"success": True, "data": response.data[0]}
            else:
                return {"success": False, "error": "Profile not found"}
        except Exception as e:
            logger.error(f"Error getting user profile: {str(e)}")
            return {"success": False, "error": str(e)}
    
    # Chatbot Management Methods
    async def create_chatbot(self, user_id: str, chatbot_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new chatbot"""
        try:
            chatbot_id = str(uuid.uuid4())
            data = {
                "id": chatbot_id,
                "user_id": user_id,
                "name": chatbot_data["name"],
                "description": chatbot_data.get("description"),
                "industry": chatbot_data.get("industry"),
                "status": "draft",
                "knowledge_base_size": 0,
                "total_conversations": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            response = self.supabase.table("chatbots").insert(data).execute()
            return {"success": True, "data": response.data[0]}
        except Exception as e:
            logger.error(f"Error creating chatbot: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_user_chatbots(self, user_id: str) -> Dict[str, Any]:
        """Get all chatbots for a user"""
        try:
            response = self.supabase.table("chatbots").select("*").eq("user_id", user_id).execute()
            return {"success": True, "data": response.data}
        except Exception as e:
            logger.error(f"Error getting user chatbots: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_chatbot(self, chatbot_id: str, user_id: str) -> Dict[str, Any]:
        """Get specific chatbot"""
        try:
            response = (self.supabase.table("chatbots")
                       .select("*")
                       .eq("id", chatbot_id)
                       .eq("user_id", user_id)
                       .execute())
            
            if response.data:
                return {"success": True, "data": response.data[0]}
            else:
                return {"success": False, "error": "Chatbot not found"}
        except Exception as e:
            logger.error(f"Error getting chatbot: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def update_chatbot(self, chatbot_id: str, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update chatbot data"""
        try:
            updates["updated_at"] = datetime.now(timezone.utc).isoformat()
            
            response = (self.supabase.table("chatbots")
                       .update(updates)
                       .eq("id", chatbot_id)
                       .eq("user_id", user_id)
                       .execute())
            
            return {"success": True, "data": response.data}
        except Exception as e:
            logger.error(f"Error updating chatbot: {str(e)}")
            return {"success": False, "error": str(e)}
    
    # Knowledge Base Methods
    async def add_knowledge_item(self, chatbot_id: str, content: str, source: str = None, category: str = None) -> Dict[str, Any]:
        """Add item to chatbot knowledge base"""
        try:
            data = {
                "id": str(uuid.uuid4()),
                "chatbot_id": chatbot_id,
                "content": content,
                "source": source,
                "category": category,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            response = self.supabase.table("knowledge_base").insert(data).execute()
            
            # Update chatbot knowledge base size
            await self.update_knowledge_base_size(chatbot_id)
            
            return {"success": True, "data": response.data[0]}
        except Exception as e:
            logger.error(f"Error adding knowledge item: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_knowledge_base(self, chatbot_id: str) -> Dict[str, Any]:
        """Get all knowledge base items for a chatbot"""
        try:
            response = self.supabase.table("knowledge_base").select("*").eq("chatbot_id", chatbot_id).execute()
            return {"success": True, "data": response.data}
        except Exception as e:
            logger.error(f"Error getting knowledge base: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def update_knowledge_base_size(self, chatbot_id: str) -> None:
        """Update the knowledge base size count for a chatbot"""
        try:
            # Count knowledge base items
            response = self.supabase.table("knowledge_base").select("id", count="exact").eq("chatbot_id", chatbot_id).execute()
            count = response.count or 0
            
            # Update chatbot record
            self.supabase.table("chatbots").update({"knowledge_base_size": count}).eq("id", chatbot_id).execute()
        except Exception as e:
            logger.error(f"Error updating knowledge base size: {str(e)}")
    
    # Conversation Methods
    async def log_conversation(self, chatbot_id: str, user_message: str, bot_response: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """Log a conversation between user and chatbot"""
        try:
            data = {
                "id": str(uuid.uuid4()),
                "chatbot_id": chatbot_id,
                "user_message": user_message,
                "bot_response": bot_response,
                "sentiment": metadata.get("sentiment") if metadata else None,
                "confidence": metadata.get("confidence") if metadata else None,
                "is_hoax_detected": metadata.get("is_hoax_detected") if metadata else None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            response = self.supabase.table("conversations").insert(data).execute()
            
            # Update chatbot conversation count
            await self.increment_conversation_count(chatbot_id)
            
            return {"success": True, "data": response.data[0]}
        except Exception as e:
            logger.error(f"Error logging conversation: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def increment_conversation_count(self, chatbot_id: str) -> None:
        """Increment the total conversation count for a chatbot"""
        try:
            # Get current count
            response = self.supabase.table("chatbots").select("total_conversations").eq("id", chatbot_id).execute()
            if response.data:
                current_count = response.data[0].get("total_conversations", 0)
                new_count = current_count + 1
                
                # Update count
                self.supabase.table("chatbots").update({"total_conversations": new_count}).eq("id", chatbot_id).execute()
        except Exception as e:
            logger.error(f"Error incrementing conversation count: {str(e)}")
    
    async def get_chatbot_analytics(self, chatbot_id: str, days: int = 30) -> Dict[str, Any]:
        """Get analytics data for a chatbot"""
        try:
            # Get conversation data from the last N days
            from datetime import timedelta
            start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
            
            response = (self.supabase.table("conversations")
                       .select("*")
                       .eq("chatbot_id", chatbot_id)
                       .gte("created_at", start_date)
                       .execute())
            
            conversations = response.data
            
            # Calculate analytics
            total_conversations = len(conversations)
            sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
            
            for conv in conversations:
                sentiment = conv.get("sentiment", "neutral")
                if sentiment in sentiment_counts:
                    sentiment_counts[sentiment] += 1
            
            # Calculate percentages
            if total_conversations > 0:
                sentiment_distribution = {
                    k: round((v / total_conversations) * 100, 1) 
                    for k, v in sentiment_counts.items()
                }
            else:
                sentiment_distribution = {"positive": 0, "negative": 0, "neutral": 0}
            
            return {
                "success": True,
                "data": {
                    "total_conversations": total_conversations,
                    "sentiment_distribution": sentiment_distribution,
                    "period_days": days
                }
            }
        except Exception as e:
            logger.error(f"Error getting chatbot analytics: {str(e)}")
            return {"success": False, "error": str(e)}

# Global instance
supabase_service = SupabaseService()
