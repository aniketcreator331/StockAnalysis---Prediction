from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from auth_db import create_user, verify_user

router = APIRouter()

GOOGLE_CLIENT_ID = "799612911628-aaqbfkc08lbeiq6irb3ulltml24ougtc.apps.googleusercontent.com"

class GoogleToken(BaseModel):
    token: str

class EmailAuthRequest(BaseModel):
    email: str
    password: str

@router.post("/auth/register")
async def register_user(data: EmailAuthRequest):
    success = create_user(data.email, data.password)
    if not success:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return {
        "status": "success",
        "access_token": "verified_app_token_xyz123",
        "user": {
            "email": data.email,
            "name": data.email.split('@')[0], 
            "picture": "",
            "id": data.email
        }
    }

@router.post("/auth/login")
async def login_user(data: EmailAuthRequest):
    success = verify_user(data.email, data.password)
    if not success:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "status": "success",
        "access_token": "verified_app_token_xyz123",
        "user": {
            "email": data.email,
            "name": data.email.split('@')[0], 
            "picture": "",
            "id": data.email
        }
    }

@router.post("/auth/google")
async def verify_google_token(data: GoogleToken):
    # Depending on the frontend, data.token could be an id_token OR an access_token.
    # Since we're moving to custom buttons with useGoogleLogin, it returns an access_token.
    import requests as py_requests
    try:
        # Use access token to get user info from Google
        google_response = py_requests.get(
            f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={data.token}"
        )
        
        if google_response.status_code != 200:
            raise ValueError("Invalid access token")
            
        idinfo = google_response.json()

        # Token is valid! Extract user info
        user_email = idinfo.get('email', '')
        user_name = idinfo.get('name', '')
        google_id = idinfo.get('sub', '')
        picture = idinfo.get('picture', '')

        # Return a session token for the user to use your API
        return {
            "status": "success",
            "access_token": "verified_app_token_xyz123", 
            "user": {
                "email": user_email,
                "name": user_name,
                "picture": picture,
                "id": google_id
            }
        }

    except Exception as e:
        # Invalid token
        raise HTTPException(status_code=401, detail="Invalid Google authentication token")
