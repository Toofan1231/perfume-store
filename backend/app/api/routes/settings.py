from fastapi import APIRouter, Depends

from app.core.security import get_admin_user
from app.models.schemas import ShopSettings
from app.services.store import store

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
def get_settings():
    return store.read().get("settings", {})


@router.put("", dependencies=[Depends(get_admin_user)])
def update_settings(payload: ShopSettings):
    data = store.read()
    data["settings"] = payload.model_dump()
    store.write(data)
    return data["settings"]
