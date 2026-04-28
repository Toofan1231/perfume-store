from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.security import get_admin_user, get_current_user
from app.models.schemas import OrderCreate, OrderStatusUpdate
from app.services.store import new_id, store

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", dependencies=[Depends(get_admin_user)])
def list_orders(status: str | None = None, page: int = Query(default=1, ge=1), limit: int = Query(default=20, ge=1, le=100)):
    rows = store.all("orders")
    if status:
        rows = [row for row in rows if row.get("status") == status]
    rows = sorted(rows, key=lambda item: item.get("createdAt", ""), reverse=True)
    total = len(rows)
    start = (page - 1) * limit
    return {"items": rows[start:start + limit], "page": page, "limit": limit, "total": total}


@router.get("/mine")
def my_orders(user: dict = Depends(get_current_user)):
    return [row for row in store.all("orders") if row.get("userId") == user["uid"]]


@router.post("")
def create_order(payload: OrderCreate, user: dict = Depends(get_current_user)):
    if payload.userId != user["uid"] and user.get("role") != "admin":
        raise HTTPException(403, "Cannot create order for another user")

    data = payload.model_dump()
    total = sum(item["price"] * item["quantity"] for item in data["items"])
    data.update({
        "id": new_id("order"),
        "totalAmount": total,
        "status": "pending",
        "paymentStatus": "not_required" if data["paymentMethod"] == "cash" else "pending",
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": None,
    })
    return store.insert("orders", data)


@router.put("/{order_id}/status", dependencies=[Depends(get_admin_user)])
def update_order_status(order_id: str, payload: OrderStatusUpdate):
    current = store.one("orders", order_id)
    if not current:
        raise HTTPException(404, "Order not found")
    current["status"] = payload.status
    current["updatedAt"] = datetime.utcnow().isoformat()
    return store.upsert("orders", order_id, current)
