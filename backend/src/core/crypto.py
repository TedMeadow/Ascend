from cryptography.fernet import Fernet, InvalidToken
from .config import settings
from pwdlib import PasswordHash

class CryptoService:
    def __init__(self, key: str):
        self.fernet = Fernet(key.encode())

    def encrypt(self, data: str) -> str:
        """Шифрует строку и возвращает зашифрованную строку."""
        return self.fernet.encrypt(data.encode()).decode()

    def decrypt(self, encrypted_data: str) -> str | None:
        """Дешифрует строку. Возвращает None в случае ошибки."""
        try:
            return self.fernet.decrypt(encrypted_data.encode()).decode()
        except InvalidToken:
            # Эта ошибка возникает, если токен неверный или ключ не подходит
            return None


crypto_service = CryptoService(settings.ENCRYPTION_KEY)
password_hash = PasswordHash.recommended()
