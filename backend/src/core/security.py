import logging
import jwt
from typing import Optional
from datetime import timedelta
from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from .crypto import password_hash
from .jwt_schemas import TokenData
from .config import settings
from sqlmodel import select, or_, Session
from .database import get_db
from .utils import get_current_time
from src.models.user import User

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer("auth/token")

REFRESH_TOKEN_COOKIE = "refresh_token"


def _decode_token(token: str) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        username = payload.get("username")
        email = payload.get("email")
        if not username and not email:
            raise credentials_exception
        return TokenData(username=username, email=email)
    except InvalidTokenError as e:
        logger.debug("Token decode error: %s", e)
        raise credentials_exception


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    token_data = _decode_token(token)
    user = db.exec(
        select(User).where(
            or_(User.email == token_data.email, User.username == token_data.username)
        )
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_user_from_refresh_cookie(
    refresh_token: Optional[str] = Cookie(default=None, alias=REFRESH_TOKEN_COOKIE),
    db: Session = Depends(get_db),
) -> User:
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    token_data = _decode_token(refresh_token)
    user = db.exec(
        select(User).where(
            or_(User.email == token_data.email, User.username == token_data.username)
        )
    ).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    return user


def get_current_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user


def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(plain_password):
    return password_hash.hash(plain_password)


def create_access_token(data: TokenData, expires_delta: Optional[timedelta] = None):
    to_encode = data.model_dump()
    expire = get_current_time() + (
        expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: TokenData) -> str:
    to_encode = data.model_dump()
    expire = get_current_time() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
