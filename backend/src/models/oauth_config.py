from sqlmodel import Field, SQLModel


class OAuthProviderConfig(SQLModel, table=True):
    provider: str = Field(primary_key=True)  # "google", "github", etc.
    client_id: str
    client_secret: str  # ВАЖНО: В реальном продакшене секреты нужно шифровать!
    server_metadata_url: str
    is_active: bool = Field(default=False, index=True)
