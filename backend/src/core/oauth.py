from authlib.integrations.starlette_client import OAuth
from sqlmodel import Session, select
from src.core.crypto import crypto_service
from src.core.database import engine
from src.models.oauth_config import OAuthProviderConfig

oauth = OAuth()


def load_and_register_providers():
    """Загружает активные конфигурации OAuth из БД и регистрирует их в Authlib."""
    print("Loading and registering OAuth providers...")
    with Session(engine) as session:
        statement = select(OAuthProviderConfig).where(
            OAuthProviderConfig.is_active == True
        )  # noqa: E712
        active_providers = session.exec(statement).all()

        for provider_config in active_providers:
            decrypted_secret = crypto_service.decrypt(provider_config.client_secret)
            if not decrypted_secret:
                print(
                    f"ERROR: Could not decrypt secret for provider '{provider_config.provider}'. Skipping."
                )
                continue

            oauth.register(
                name=provider_config.provider,
                client_id=provider_config.client_id,
                client_secret=decrypted_secret,
                server_metadata_url=provider_config.server_metadata_url,
                client_kwargs={"scope": "openid email profile"},
            )
    print(f"Successfully registered providers: {[p for p in oauth._clients.keys()]}")
