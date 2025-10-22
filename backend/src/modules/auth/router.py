from typing import List
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select, or_

from src.core.oauth import oauth
from src.core.database import get_db
from src.core.security import get_password_hash, verify_password, create_access_token
from src.core.jwt_schemas import TokenData
from src.models import User, OAuthAccount

from .schemas import ProviderInfo, UserCreate, UserPublic, Token

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.get("/providers", response_model=List[ProviderInfo])
def get_active_providers():
    return [{"name": name} for name in oauth._clients.keys()]


@auth_router.get("/login/{provider}")
async def login_via_provider(request: Request, provider: str):
    if provider not in oauth._clients:
        raise HTTPException(
            status_code=404, detail="Provider not configured or inactive"
        )
    redirect_uri = request.url_for("auth_callback", provider=provider)
    return await oauth.create_client(provider).authorize_redirect(request, redirect_uri)


@auth_router.get("/{provider}/callback")
async def auth_callback(request: Request, provider: str, db: Session = Depends(get_db)):
    if provider not in oauth._clients:
        raise HTTPException(
            status_code=404, detail="Provider not configured or inactive"
        )

    token = await oauth.create_client(provider).authorize_access_token(request)
    user_info = token.get("userinfo")
    if not user_info:
        raise HTTPException(status_code=400, detail="Could not retrieve user info")

    email = user_info["email"]
    provider_account_id = user_info["sub"]

    oauth_account = db.exec(
        select(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.account_id == provider_account_id,
        )
    ).first()

    if oauth_account:
        user = oauth_account.user
    else:
        user = db.exec(select(User).where(User.email == email)).first()
        if not user:
            user = User(email=email, username=email)  # Простое создание юзера
            db.add(user)
            db.commit()
            db.refresh(user)

        new_oauth_account = OAuthAccount(
            provider=provider, account_id=provider_account_id, user_id=user.id
        )
        db.add(new_oauth_account)
        db.commit()

    # ЗАГЛУШКА: Здесь вы должны создать свой JWT токен
    access_token = f"jwt-token-for-{user.email}"

    # Редирект на фронтенд с токеном
    response = RedirectResponse(
        url=f"http://localhost:3000/auth/callback?token={access_token}"
    )
    return response


@auth_router.post("/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)) -> UserPublic:
    if db.exec(
        select(User).where(
            or_(User.username == user_data.username, User.email == user_data.email)
        )
    ).first():
        raise HTTPException(
            status_code=409,
            detail="User with provided email or username already exists",
        )
    hashed_password = get_password_hash(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@auth_router.post("/token", response_model=Token)
async def get_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.exec(
        select(User).where(
            or_(User.username == form_data.username, User.email == form_data.username)
        )
    ).first()
    if not user:
        raise HTTPException(401, "username/email or password are incorrect")
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(401, "username/email or password are incorrect")
    token_data = TokenData(username=user.username, email=user.email)
    token = create_access_token(token_data)
    return Token(access_token=token, token_type="bearer").model_dump()
