from pydantic import BaseModel
from typing import Union


class TokenData(BaseModel):
    username: Union[str, None] = None
    email: Union[str, None] = None
    