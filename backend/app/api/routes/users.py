from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_admin_user, get_current_user
from app.models.schemas import UserProfileUpdate, UserRoleUpdate
from app.services.store import store

router = APIRouter(prefix="/users", tags=["users"])


def public_user(user: dict) -> dict:
    return {key: value for key, value in user.items() if key not in {"password", "passwordHash"}}


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    for row in store.all("users"):
        if row.get("uid") == user["uid"]:
            return public_user(row)
    return user


@router.put("/me")
def update_me(payload: UserProfileUpdate, user: dict = Depends(get_current_user)):
    current = store.one("users", user["uid"], id_key="uid")
    if not current:
        raise HTTPException(404, "User not found")
    current["displayName"] = payload.displayName
    current["addresses"] = [item.model_dump() for item in payload.addresses]
    return public_user(store.upsert("users", user["uid"], current, id_key="uid"))


@router.get("", dependencies=[Depends(get_admin_user)])
def list_users():
    return [public_user(row) for row in store.all("users")]


@router.put("/{uid}/role", dependencies=[Depends(get_admin_user)])
def update_user_role(uid: str, payload: UserRoleUpdate):
    current = store.one("users", uid, id_key="uid")
    if not current:
        raise HTTPException(404, "User not found")
    current["role"] = payload.role
    return public_user(store.upsert("users", uid, current, id_key="uid"))


@router.delete("/{uid}", dependencies=[Depends(get_admin_user)])
def delete_user(uid: str):
    store.delete("users", uid, id_key="uid")
    return {"message": "User deleted"}
