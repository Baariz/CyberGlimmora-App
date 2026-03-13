import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.user import User
from app.schemas.auth import TokenResponse, UserOut
from app.utils.jwt import create_access_token

router = APIRouter()

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
REDIRECT_URI = "http://localhost:8000/auth/google/callback"

@router.get("/google")
def google_login():
    """
    Step 1 — Redirect user to Google login page.
    Frontend just opens this URL in a browser.
    """
    params = (
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        f"&response_type=code"
        f"&scope=openid email profile"
        f"&access_type=offline"
    )
    return RedirectResponse(GOOGLE_AUTH_URL + params)


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """
    Step 2 — Google redirects here with a code.
    We exchange the code for user info and return our JWT.
    """

    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": REDIRECT_URI,
                "grant_type": "authorization_code",
            }
        )

    token_data = token_response.json()

    if "error" in token_data:
        raise HTTPException(status_code=400, detail=token_data["error"])

    access_token = token_data["access_token"]

    # Get user info from Google
    async with httpx.AsyncClient() as client:
        userinfo_response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"}
        )

    userinfo = userinfo_response.json()

    email     = userinfo["email"]
    name      = userinfo.get("name")
    picture   = userinfo.get("picture")
    google_id = userinfo["sub"]

    # Find or create user in DB
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email=email,
            name=name,
            picture=picture,
            google_id=google_id
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Create and return our JWT
    token = create_access_token({
        "sub": user.id,
        "email": user.email
    })

    return TokenResponse(
        access_token=token,
        user=UserOut(
            id=user.id,
            email=user.email,
            name=user.name,
            picture=user.picture
        )
    )


@router.get("/me")
def get_me(db: Session = Depends(get_db)):
    """
    TODO: add get_current_user dependency once auth is wired up
    """
    pass