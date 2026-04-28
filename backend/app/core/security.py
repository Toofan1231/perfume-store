from __future__ import annotations

import hashlib
import hmac
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.store import store

security = HTTPBearer(auto_error=False)

STATIC_TOKENS = {
    "demo-admin-token": "admin-demo",
    "demo-customer-token": "customer-demo",
}


def hash_password(password: str, salt: str | None = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000)
    return f"pbkdf2_sha256${salt}${digest.hex()}"


def verify_password(password: str, stored_password: str | None) -> bool:
    if not stored_password:
        return False
    if stored_password.startswith("pbkdf2_sha256$"):
        _, salt, expected = stored_password.split("$", 2)
        actual = hash_password(password, salt).split("$", 2)[2]
        return hmac.compare_digest(actual, expected)
    # Backward-compatible demo mode for existing local JSON users.
    return hmac.compare_digest(password, stored_password)


def make_token(uid: str, role: str) -> str:
    if uid == "admin-demo" and role == "admin":
        return "demo-admin-token"
    if uid == "customer-demo":
        return "demo-customer-token"
    return f"demo-user-{uid}"


def user_from_token(token: str) -> dict | None:
    uid = STATIC_TOKENS.get(token)
    if token.startswith("demo-user-"):
        uid = token.replace("demo-user-", "", 1)
    if not uid:
        return None

    for user in store.all("users"):
        if user.get("uid") == uid:
            return {key: value for key, value in user.items() if key not in {"password", "passwordHash"}}
    return None


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    user = user_from_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid demo token")
    return user


def get_optional_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict | None:
    if not credentials:
        return None
    return user_from_token(credentials.credentials)


def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return user
