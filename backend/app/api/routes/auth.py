from datetime import datetime
from fastapi import APIRouter, HTTPException

from app.core.security import hash_password, make_token, verify_password
from app.models.schemas import LoginRequest, UserCreate
from app.services.store import new_id, store

router = APIRouter(prefix="/auth", tags=["auth"])


def public_profile(user: dict) -> dict:
    return {key: value for key, value in user.items() if key not in {"password", "passwordHash"}}


@router.post("/login")
def login(payload: LoginRequest):
    for user in store.all("users"):
        if user.get("email", "").lower() == payload.email.lower():
            stored_password = user.get("passwordHash") or user.get("password")
            if verify_password(payload.password, stored_password):
                profile = public_profile(user)
                return {"token": make_token(profile["uid"], profile.get("role", "customer")), "user": profile}
    raise HTTPException(401, "Invalid email or password")


@router.post("/register")
def register(payload: UserCreate):
    users = store.all("users")
    if any(user.get("email", "").lower() == payload.email.lower() for user in users):
        raise HTTPException(409, "Email is already registered")

    user = {
        "uid": new_id("user"),
        "email": payload.email,
        "displayName": payload.displayName,
        "role": "customer",
        "addresses": [],
        "createdAt": datetime.utcnow().isoformat(),
        "passwordHash": hash_password(payload.password),
    }
    store.insert("users", user)
    profile = public_profile(user)
    return {"token": make_token(profile["uid"], profile["role"]), "user": profile}
