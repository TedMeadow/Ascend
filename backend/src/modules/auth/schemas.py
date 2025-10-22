from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class UserCreate(BaseModel):
    email: str
    username: str
    password: str


class UserPublic(BaseModel):
    username: str


class ProviderInfo(BaseModel):
    name: str
