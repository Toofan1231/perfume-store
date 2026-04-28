from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_admin_user, get_optional_user
from app.models.schemas import ReviewCreate
from app.services.store import new_id, store

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("")
def list_reviews(productId: str | None = None):
    rows = store.all("reviews")
    if productId:
        rows = [row for row in rows if row.get("productId") == productId]
    return rows


@router.post("")
def create_review(payload: ReviewCreate, user: dict | None = Depends(get_optional_user)):
    data = payload.model_dump()
    data.update({"id": new_id("review"), "createdAt": datetime.utcnow().isoformat()})
    return store.insert("reviews", data)


@router.delete("/{review_id}", dependencies=[Depends(get_admin_user)])
def delete_review(review_id: str):
    store.delete("reviews", review_id)
    return {"message": "Review deleted"}
