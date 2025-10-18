# backend/src/core/security.py
import jwt
from zoneinfo import ZoneInfo
from typing import Optional
from datetime import timedelta, datetime, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from .crypto import password_hash
from .jwt_schemas import TokenData
from .config import settings
from sqlmodel import select, or_, Session
from .database import get_db
from .utils import get_current_time
# ...Здесь будет ваша логика для JWT и get_current_user...
# ЗАГЛУШКА: пока создадим временную функцию
from src.models.user import User

oauth2_scheme = OAuth2PasswordBearer('auth/token')





def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        print(f"Входящий токен: {token}")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        print(f"Payload токена: {payload}")
        username = payload.get('username')
        email = payload.get('email')
        if not username and not email:
            raise credentials_exception
        token_data = TokenData(username=username, email=email)
    except InvalidTokenError as e:
        print(f"Ошибка декодирования токена: {e}")
        raise credentials_exception
    user = db.exec(select(User).where(
        or_(
            User.email == token_data.email,
            User.username == token_data.username
            )
        )
    ).first()
    if not user:
        raise credentials_exception
    return user
    
    

def get_current_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user




def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)

def get_password_hash(plain_password):
    return password_hash.hash(plain_password)

def create_access_token(data: TokenData, expires_delta: Optional[timedelta] = None):
    to_encode = data.model_dump()

    if expires_delta:
        expire = get_current_time() + expires_delta
    else:
        expire = get_current_time() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


