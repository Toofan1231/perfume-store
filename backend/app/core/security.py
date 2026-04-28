from __future__ import annotations

import hashlib
import hmac
import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.core.firebase import firebase_auth
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
    return hmac.compare_digest(password, stored_password)


def public_user(user: dict) -> dict:
    return {key: value for key, value in user.items() if key not in {"password", "passwordHash"}}


def make_token(uid: str, role: str) -> str:
    if uid == "admin-demo" and role == "admin":
        return "demo-admin-token"
    if uid == "customer-demo":
        return "demo-customer-token"
    return f"demo-user-{uid}"


def local_user_from_token(token: str) -> dict | None:
    uid = STATIC_TOKENS.get(token)
    if token.startswith("demo-user-"):
        uid = token.replace("demo-user-", "", 1)
    if not uid:
        return None

    for user in store.all("users"):
        if user.get("uid") == uid:
            return public_user(user)
    return None


def firebase_user_from_token(token: str) -> dict | None:
    if not settings.USE_FIREBASE or not firebase_auth:
        return None

    try:
        decoded = firebase_auth.verify_id_token(token)
        uid = decoded["uid"]
        user = store.one("users", uid, id_key="uid")
        if user:
            return public_user(user)

        # Fallback profile if Firebase Auth user exists but Firestore profile was not created yet.
        return {
            "uid": uid,
            "email": decoded.get("email", ""),
            "displayName": decoded.get("name") or decoded.get("email", "User"),
            "role": "customer",
            "addresses": [],
            "createdAt": "",
        }
    except Exception:
        return None


def user_from_token(token: str) -> dict | None:
    firebase_user = firebase_user_from_token(token)
    if firebase_user:
        return firebase_user
    return local_user_from_token(token)


def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    user = user_from_token(credentials.credentials)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return user


def get_optional_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict | None:
    if not credentials:
        return None
    return user_from_token(credentials.credentials)


def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return user
