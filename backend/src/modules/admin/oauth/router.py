from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from src.core.database import get_db
from src.models.oauth_config import OAuthProviderConfig
from src.core.crypto import crypto_service


oauth_router = APIRouter(prefix="/oauth")


@oauth_router.post("/", response_model=OAuthProviderConfig)
def create_oauth_provider(config: OAuthProviderConfig, db: Session = Depends(get_db)):
    encrypted_secret = crypto_service.encrypt(config.client_secret)
    db_config = OAuthProviderConfig.from_orm(
        config, {"client_secret": encrypted_secret}
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

@oauth_router.get("/", response_model=List[OAuthProviderConfig])
def get_all_oauth_providers(db: Session = Depends(get_db)):
    return db.exec(select(OAuthProviderConfig)).all()


# TODO PUT, DELETE
