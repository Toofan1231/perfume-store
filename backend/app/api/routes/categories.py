from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_admin_user
from app.models.schemas import CategoryCreate
from app.services.store import new_id, store

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("")
def list_categories():
    return [item for item in store.all("categories") if item.get("active", True)]


@router.post("", dependencies=[Depends(get_admin_user)])
def create_category(payload: CategoryCreate):
    data = payload.model_dump()
    data.update({"id": new_id("category"), "createdAt": datetime.utcnow().isoformat()})
    return store.insert("categories", data)


@router.put("/{category_id}", dependencies=[Depends(get_admin_user)])
def update_category(category_id: str, payload: CategoryCreate):
    if not store.one("categories", category_id):
        raise HTTPException(404, "Category not found")
    data = payload.model_dump()
    data.update({"id": category_id, "createdAt": datetime.utcnow().isoformat()})
    return store.upsert("categories", category_id, data)


@router.delete("/{category_id}", dependencies=[Depends(get_admin_user)])
def delete_category(category_id: str):
    store.delete("categories", category_id)
    return {"message": "Category deleted"}
