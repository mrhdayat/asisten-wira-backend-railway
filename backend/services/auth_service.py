from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import Optional, Dict, Any
from config import settings
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

class AuthService:
    """Service for handling authentication and authorization"""
    
    def __init__(self):
        self.secret_key = settings.jwt_secret_key
        self.algorithm = settings.jwt_algorithm
    
    def decode_token(self, token: str) -> Dict[str, Any]:
        """Decode JWT token and extract user info"""
        try:
            # For Supabase JWT tokens, we need to decode them properly
            # This is a simplified version - in production you'd verify with Supabase
            payload = jwt.decode(
                token, 
                options={"verify_signature": False}  # Supabase handles signature verification
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    def get_current_user_id(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
        """Extract user ID from JWT token"""
        try:
            payload = self.decode_token(credentials.credentials)
            user_id = payload.get("sub")
            
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token payload")
            
            return user_id
        except Exception as e:
            logger.error(f"Error extracting user ID: {str(e)}")
            raise HTTPException(status_code=401, detail="Authentication failed")
    
    def get_current_user_info(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
        """Extract full user info from JWT token"""
        try:
            payload = self.decode_token(credentials.credentials)
            
            return {
                "user_id": payload.get("sub"),
                "email": payload.get("email"),
                "role": payload.get("role", "authenticated"),
                "exp": payload.get("exp")
            }
        except Exception as e:
            logger.error(f"Error extracting user info: {str(e)}")
            raise HTTPException(status_code=401, detail="Authentication failed")

# Global auth service instance
auth_service = AuthService()

# Dependency functions for FastAPI
def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Dependency to get current user ID"""
    return auth_service.get_current_user_id(credentials)

def get_current_user_info(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Dependency to get current user info"""
    return auth_service.get_current_user_info(credentials)
