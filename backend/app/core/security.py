import hashlib
import secrets

from pwdlib import PasswordHash

# Argon2id, with pwdlib's recommended parameters.
password_hash = PasswordHash.recommended()
# Checked against when the username doesn't exist, so a login takes as long either way
# and the response time doesn't reveal which usernames exist.
DUMMY_HASH = password_hash.hash(secrets.token_urlsafe())


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed: str | None) -> bool:
    if hashed is None:
        password_hash.verify(password, DUMMY_HASH)
        return False
    return password_hash.verify(password, hashed)


def new_session_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
