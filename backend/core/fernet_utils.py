# core/fernet_utils.py
from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings


def _fernet() -> Fernet:
    key = settings.FERNET_KEY
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_id(pk: int) -> str:
    """Encrypt an integer PK to a URL-safe string."""
    return _fernet().encrypt(str(pk).encode()).decode()


def decrypt_id(token: str) -> int:
    """
    Decrypt a Fernet token back to an integer PK.
    Raises ValueError so callers can return 400/404.
    """
    try:
        return int(_fernet().decrypt(token.encode()).decode())
    except (InvalidToken, ValueError, Exception) as exc:
        raise ValueError("Invalid or tampered token") from exc